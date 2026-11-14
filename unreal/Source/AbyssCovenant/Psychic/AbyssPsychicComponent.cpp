#include "Psychic/AbyssPsychicComponent.h"
#include "AbyssCovenant.h"
#include "Net/UnrealNetwork.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/Controller.h"
#include "GameFramework/DamageType.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"
#include "TimerManager.h"

namespace AbyssPsychic
{
	constexpr float SpellRange = 4000.f;
	constexpr float BlastRadius = 350.f;
	constexpr float SplitAngle = 8.f;      // 分裂的左右偏角
	constexpr float SplitDamageScale = 0.6f;
	constexpr float DelaySeconds = 1.0f;
}

UAbyssPsychicComponent::UAbyssPsychicComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	SetIsReplicatedByDefault(true);
}

void UAbyssPsychicComponent::BeginPlay()
{
	Super::BeginPlay();

	if (bIsTidecaller)
	{
		MaxOverload *= 1.3f; // 唤潮者过载上限更高
	}
	Mana = MaxMana;
	Overload = 0.f;

	// 只有服务器负责恢复和衰减，结果自动同步
	SetComponentTickEnabled(GetOwner() && GetOwner()->HasAuthority());
}

void UAbyssPsychicComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(UAbyssPsychicComponent, Mana);
	DOREPLIFETIME(UAbyssPsychicComponent, Overload);
	DOREPLIFETIME(UAbyssPsychicComponent, EquippedSpells);
}

void UAbyssPsychicComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	Mana = FMath::Min(MaxMana, Mana + ManaRegenPerSecond * DeltaTime);
	Overload = FMath::Max(0.f, Overload - OverloadDecayPerSecond * DeltaTime);
}

int32 UAbyssPsychicComponent::GetTotalSlots() const
{
	return CoreSlots + (bIsTidecaller ? 1 : 0);
}

bool UAbyssPsychicComponent::CanEquip(const FPsychicSpell& Spell) const
{
	return Spell.GetSlotCost() <= GetTotalSlots();
}

float UAbyssPsychicComponent::GetOverloadRatio() const
{
	return MaxOverload > 0.f ? FMath::Clamp(Overload / MaxOverload, 0.f, 1.f) : 0.f;
}

float UAbyssPsychicComponent::GetManaCost(const FPsychicSpell& Spell) const
{
	float Cost = 0.f;
	switch (Spell.Form)
	{
	case ERuneForm::Bolt:   Cost = 15.f; break;
	case ERuneForm::Blast:  Cost = 30.f; break;
	case ERuneForm::Shield: Cost = 20.f; break;
	case ERuneForm::Summon: Cost = 40.f; break;
	}
	Cost += 10.f * Spell.Modifiers.Num();
	return Cost;
}

float UAbyssPsychicComponent::GetBaseDamage(ERuneForm Form) const
{
	switch (Form)
	{
	case ERuneForm::Bolt:  return 25.f;
	case ERuneForm::Blast: return 40.f;
	default:               return 0.f; // 护盾、召唤不直接造成伤害
	}
}

float UAbyssPsychicComponent::GetElementMultiplier(ERuneElement Element) const
{
	switch (Element)
	{
	case ERuneElement::Fire:      return 1.0f;
	case ERuneElement::Lightning: return 0.9f;
	case ERuneElement::Void:      return 1.3f; // 虚空伤害高，但以后可以让它更容易过载
	case ERuneElement::Mind:      return 0.6f; // 心灵伤害低，以后加控制效果
	}
	return 1.f;
}

// ======================= 施法 =======================

void UAbyssPsychicComponent::CastSpell(int32 SpellIndex)
{
	APawn* Pawn = Cast<APawn>(GetOwner());
	if (!Pawn || !Pawn->IsLocallyControlled() || !EquippedSpells.IsValidIndex(SpellIndex))
	{
		return;
	}

	AController* Controller = Pawn->GetController();
	if (!Controller)
	{
		return;
	}

	FVector ViewLocation;
	FRotator ViewRotation;
	Controller->GetPlayerViewPoint(ViewLocation, ViewRotation);

	Server_CastSpell(SpellIndex, ViewLocation, ViewRotation.Vector());
}

void UAbyssPsychicComponent::Server_CastSpell_Implementation(int32 SpellIndex, FVector_NetQuantize Start, FVector_NetQuantizeNormal Direction)
{
	if (!EquippedSpells.IsValidIndex(SpellIndex) || !GetOwner())
	{
		return;
	}

	const FPsychicSpell Spell = EquippedSpells[SpellIndex];
	if (!CanEquip(Spell))
	{
		return; // 符文槽不够，非法技能
	}
	if (FVector::Dist(Start, GetOwner()->GetActorLocation()) > 300.f)
	{
		return; // 基础防作弊
	}

	// ---- 结算代价 ----
	const float Cost = GetManaCost(Spell);
	const float Paid = FMath::Min(Mana, Cost);
	const float Missing = Cost - Paid;   // 灵能不够的部分，强行透支

	Mana -= Paid;
	Overload += Paid * OverloadPerManaSpent + Missing * 2.f;

	// ---- 释放 ----
	if (Spell.HasModifier(ERuneModifier::Delayed))
	{
		FTimerHandle Handle;
		const FVector StartCopy = Start;
		const FVector DirCopy = Direction;
		GetWorld()->GetTimerManager().SetTimer(Handle,
			FTimerDelegate::CreateWeakLambda(this, [this, Spell, StartCopy, DirCopy]()
			{
				ExecuteSpell(Spell, StartCopy, DirCopy);
			}),
			AbyssPsychic::DelaySeconds, false);
	}
	else
	{
		ExecuteSpell(Spell, Start, Direction);
	}

	// ---- 过载检查 ----
	if (Overload >= MaxOverload)
	{
		TriggerBacklash();
	}
}

void UAbyssPsychicComponent::ExecuteSpell(const FPsychicSpell& Spell, const FVector& Start, const FVector& Direction)
{
	if (Spell.HasModifier(ERuneModifier::Split))
	{
		// 分裂：中间一发 + 左右各一发，每发伤害降低
		const float S = AbyssPsychic::SplitDamageScale;
		ExecuteSingleCast(Spell, Start, Direction, S);
		ExecuteSingleCast(Spell, Start, FRotator(0.f, AbyssPsychic::SplitAngle, 0.f).RotateVector(Direction), S);
		ExecuteSingleCast(Spell, Start, FRotator(0.f, -AbyssPsychic::SplitAngle, 0.f).RotateVector(Direction), S);
	}
	else
	{
		ExecuteSingleCast(Spell, Start, Direction, 1.f);
	}
}

void UAbyssPsychicComponent::ExecuteSingleCast(const FPsychicSpell& Spell, const FVector& Start, const FVector& Direction, float DamageScale)
{
	AActor* Owner = GetOwner();
	APawn* Pawn = Cast<APawn>(Owner);
	AController* Instigator = Pawn ? Pawn->GetController() : nullptr;

	const FVector End = Start + Direction * AbyssPsychic::SpellRange;
	FCollisionQueryParams Params(SCENE_QUERY_STAT(AbyssSpellTrace), true, Owner);

	FHitResult Hit;
	const bool bHit = GetWorld()->LineTraceSingleByChannel(Hit, Start, End, ECC_Visibility, Params);
	const FVector Impact = bHit ? Hit.ImpactPoint : End;

	const float Damage = GetBaseDamage(Spell.Form) * GetElementMultiplier(Spell.Element) * DamageScale;

	switch (Spell.Form)
	{
	case ERuneForm::Bolt:
		if (bHit && Hit.GetActor() && Damage > 0.f)
		{
			UGameplayStatics::ApplyPointDamage(Hit.GetActor(), Damage, Direction, Hit, Instigator, Owner, UDamageType::StaticClass());
		}
		break;

	case ERuneForm::Blast:
	{
		TArray<AActor*> Ignore;
		Ignore.Add(Owner); // 自己的爆炸不炸自己（反噬除外）
		UGameplayStatics::ApplyRadialDamage(this, Damage, Impact, AbyssPsychic::BlastRadius, UDamageType::StaticClass(), Ignore, Owner, Instigator, false);
		break;
	}

	case ERuneForm::Shield:
	case ERuneForm::Summon:
		// 交给蓝图：在 OnSpellCast 里生成护盾 / 召唤物
		break;
	}

	// 追踪（Homing）需要弹道类投射物，目前由蓝图在 OnSpellCast 里生成
	Multicast_SpellFX(Spell, Start, Impact);
}

void UAbyssPsychicComponent::TriggerBacklash()
{
	AActor* Owner = GetOwner();
	if (!Owner)
	{
		return;
	}

	const float Overflow = Overload - MaxOverload;

	// 无论是否免疫，过载都回落到一半
	Overload = MaxOverload * 0.5f;

	if (bIsTidecaller && FMath::FRand() < TidecallerBacklashIgnoreChance)
	{
		UE_LOG(LogAbyss, Log, TEXT("Tidecaller resisted backlash"));
		return;
	}

	EBacklashTier Tier = EBacklashTier::Minor;
	if (Overflow >= 35.f)
	{
		Tier = EBacklashTier::Severe;
	}
	else if (Overflow >= 15.f)
	{
		Tier = EBacklashTier::Moderate;
	}

	const FVector Location = Owner->GetActorLocation();
	APawn* Pawn = Cast<APawn>(Owner);
	AController* Instigator = Pawn ? Pawn->GetController() : nullptr;

	switch (Tier)
	{
	case EBacklashTier::Minor:
		UGameplayStatics::ApplyDamage(Owner, 10.f, Instigator, Owner, UDamageType::StaticClass());
		break;

	case EBacklashTier::Moderate:
	{
		// 范围爆炸，不排除任何人：队友和自己都会受伤
		TArray<AActor*> Ignore;
		UGameplayStatics::ApplyRadialDamage(this, 30.f, Location, 400.f, UDamageType::StaticClass(), Ignore, Owner, Instigator, true);
		break;
	}

	case EBacklashTier::Severe:
		UGameplayStatics::ApplyDamage(Owner, 20.f, Instigator, Owner, UDamageType::StaticClass());
		// 召唤恶魔：在蓝图的 OnBacklash 里实现（服务器上 Spawn 敌人）
		break;
	}

	Multicast_Backlash(Tier, Location);
}

void UAbyssPsychicComponent::Multicast_SpellFX_Implementation(const FPsychicSpell& Spell, FVector_NetQuantize Start, FVector_NetQuantize End)
{
	OnSpellCast.Broadcast(Spell, Start, End);
}

void UAbyssPsychicComponent::Multicast_Backlash_Implementation(EBacklashTier Tier, FVector_NetQuantize Location)
{
	OnBacklash.Broadcast(Tier, Location);
}
