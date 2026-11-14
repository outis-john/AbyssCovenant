#include "Combat/AbyssHealthComponent.h"
#include "Core/AbyssGameMode.h"
#include "AbyssCovenant.h"
#include "Net/UnrealNetwork.h"
#include "GameFramework/Actor.h"
#include "GameFramework/Controller.h"
#include "Engine/World.h"

UAbyssHealthComponent::UAbyssHealthComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
	SetIsReplicatedByDefault(true);
}

void UAbyssHealthComponent::BeginPlay()
{
	Super::BeginPlay();

	Health = MaxHealth;

	// 只有服务器处理伤害
	if (GetOwner() && GetOwner()->HasAuthority())
	{
		GetOwner()->OnTakeAnyDamage.AddDynamic(this, &UAbyssHealthComponent::HandleAnyDamage);
	}
}

void UAbyssHealthComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(UAbyssHealthComponent, Health);
	DOREPLIFETIME(UAbyssHealthComponent, bIsDead);
}

void UAbyssHealthComponent::HandleAnyDamage(AActor* DamagedActor, float Damage, const UDamageType* DamageType, AController* InstigatedBy, AActor* DamageCauser)
{
	if (bIsDead || Damage <= 0.f)
	{
		return;
	}

	Health = FMath::Clamp(Health - Damage, 0.f, MaxHealth);
	OnHealthChanged.Broadcast(Health, MaxHealth); // 服务器自己也要触发一次

	if (Health <= 0.f)
	{
		Die(InstigatedBy);
	}
}

void UAbyssHealthComponent::Heal(float Amount)
{
	if (bIsDead || Amount <= 0.f)
	{
		return;
	}
	Health = FMath::Clamp(Health + Amount, 0.f, MaxHealth);
	OnHealthChanged.Broadcast(Health, MaxHealth);
}

void UAbyssHealthComponent::Die(AController* Killer)
{
	bIsDead = true;
	OnDeath.Broadcast(Killer);

	// 通知 GameMode：敌人死亡 -> 更新撤离条件；玩家死亡 -> 检查是否全灭
	if (AAbyssGameMode* GM = GetWorld()->GetAuthGameMode<AAbyssGameMode>())
	{
		if (bIsEnemy)
		{
			GM->NotifyEnemyKilled(bIsElite);
		}
		else
		{
			GM->NotifyPlayerDied();
		}
	}

	UE_LOG(LogAbyss, Log, TEXT("%s died"), *GetNameSafe(GetOwner()));
}

void UAbyssHealthComponent::OnRep_Health()
{
	OnHealthChanged.Broadcast(Health, MaxHealth);
}

void UAbyssHealthComponent::OnRep_IsDead()
{
	if (bIsDead)
	{
		OnDeath.Broadcast(nullptr);
	}
}
