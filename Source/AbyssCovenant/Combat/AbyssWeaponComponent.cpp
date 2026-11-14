#include "Combat/AbyssWeaponComponent.h"
#include "Combat/AbyssHealthComponent.h"
#include "AbyssCovenant.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/Controller.h"
#include "GameFramework/DamageType.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"

UAbyssWeaponComponent::UAbyssWeaponComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
	SetIsReplicatedByDefault(true);
}

void UAbyssWeaponComponent::Fire()
{
	APawn* Pawn = Cast<APawn>(GetOwner());
	if (!Pawn || !Pawn->IsLocallyControlled() || FireRate <= 0.f)
	{
		return;
	}

	const float Now = GetWorld()->GetTimeSeconds();
	if (Now - LastLocalFireTime < 1.f / FireRate)
	{
		return; // 还没到下一发的时间
	}
	LastLocalFireTime = Now;

	AController* Controller = Pawn->GetController();
	if (!Controller)
	{
		return;
	}

	FVector ViewLocation;
	FRotator ViewRotation;
	Controller->GetPlayerViewPoint(ViewLocation, ViewRotation);

	// 本地立即反馈，手感不受网络延迟影响
	ApplyLocalRecoil();
	OnLocalFire.Broadcast();

	Server_Fire(ViewLocation, ViewRotation.Vector());
}

void UAbyssWeaponComponent::ApplyLocalRecoil()
{
	APawn* Pawn = Cast<APawn>(GetOwner());
	AController* Controller = Pawn ? Pawn->GetController() : nullptr;
	if (!Controller)
	{
		return;
	}
	const float Yaw = FMath::FRandRange(-RecoilYawRandom, RecoilYawRandom);
	// Pitch 为正 = 枪口上抬
	Controller->SetControlRotation(Controller->GetControlRotation() + FRotator(RecoilPitch, Yaw, 0.f));
}

void UAbyssWeaponComponent::Server_Fire_Implementation(FVector_NetQuantize Start, FVector_NetQuantizeNormal Direction)
{
	APawn* Pawn = Cast<APawn>(GetOwner());
	if (!Pawn)
	{
		return;
	}

	// ---- 防作弊的基础检查 ----
	const float Now = GetWorld()->GetTimeSeconds();
	// 允许 20% 的误差，避免网络抖动导致正常开枪被拒绝
	if (Now - LastServerFireTime < (1.f / FireRate) * 0.8f)
	{
		return;
	}
	LastServerFireTime = Now;

	// 开枪位置不能离角色太远
	if (FVector::Dist(Start, Pawn->GetActorLocation()) > 300.f)
	{
		UE_LOG(LogAbyss, Warning, TEXT("Rejected shot from %s: start too far from pawn"), *GetNameSafe(Pawn));
		return;
	}

	const FVector End = Start + FVector(Direction) * Range;

	FCollisionQueryParams Params(SCENE_QUERY_STAT(AbyssWeaponTrace), /*bTraceComplex*/ true, Pawn);
	Params.bReturnPhysicalMaterial = true;

	FHitResult Hit;
	const bool bHit = GetWorld()->LineTraceSingleByChannel(Hit, Start, End, TraceChannel, Params);
	const FVector ImpactPoint = bHit ? Hit.ImpactPoint : End;

	if (bHit && Hit.GetActor())
	{
		AActor* Target = Hit.GetActor();
		const bool bWeakPoint = Hit.BoneName.ToString().Contains(TEXT("head"));
		const float FinalDamage = Damage * (bWeakPoint ? WeakPointMultiplier : 1.f);

		UAbyssHealthComponent* TargetHealth = Target->FindComponentByClass<UAbyssHealthComponent>();
		const bool bWasAlive = TargetHealth && !TargetHealth->IsDead();

		UGameplayStatics::ApplyPointDamage(Target, FinalDamage, FVector(Direction), Hit, Pawn->GetController(), Pawn, UDamageType::StaticClass());

		if (TargetHealth)
		{
			const bool bKilled = bWasAlive && TargetHealth->IsDead();
			Client_HitConfirmed(bKilled, bWeakPoint);
		}
	}

	Multicast_FireFX(Start, ImpactPoint, bHit);
}

void UAbyssWeaponComponent::Multicast_FireFX_Implementation(FVector_NetQuantize Start, FVector_NetQuantize End, bool bHit)
{
	OnFireFX.Broadcast(Start, End, bHit);
}

void UAbyssWeaponComponent::Client_HitConfirmed_Implementation(bool bKilled, bool bWeakPoint)
{
	OnHitConfirmed.Broadcast(bKilled, bWeakPoint);
}
