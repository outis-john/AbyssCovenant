#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AbyssHealthComponent.generated.h"

class UDamageType;
class AController;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FAbyssOnHealthChanged, float, NewHealth, float, MaxHealth);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FAbyssOnDeath, AController*, Killer);

/**
 * Health for players and enemies.
 * Damage is only processed on the host (server); health replicates to everyone.
 */
UCLASS(ClassGroup = (Abyss), meta = (BlueprintSpawnableComponent))
class ABYSSCOVENANT_API UAbyssHealthComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAbyssHealthComponent();

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Health")
	float MaxHealth = 100.f;

	/** Enemy only: counts toward the "kill an elite" extraction condition. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Health")
	bool bIsElite = false;

	/** True for enemies (counts toward kill conditions). False for players (counts toward squad wipe). */
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Health")
	bool bIsEnemy = false;

	UFUNCTION(BlueprintPure, Category = "Health")
	float GetHealth() const { return Health; }

	UFUNCTION(BlueprintPure, Category = "Health")
	bool IsDead() const { return bIsDead; }

	/** Server only. */
	UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Health")
	void Heal(float Amount);

	/** Fires on every machine. Use it to update the HUD. */
	UPROPERTY(BlueprintAssignable, Category = "Health")
	FAbyssOnHealthChanged OnHealthChanged;

	/** Fires on every machine. Use it for death animation / ragdoll. Killer is only valid on the server. */
	UPROPERTY(BlueprintAssignable, Category = "Health")
	FAbyssOnDeath OnDeath;

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(ReplicatedUsing = OnRep_Health, BlueprintReadOnly, Category = "Health")
	float Health = 100.f;

	UPROPERTY(ReplicatedUsing = OnRep_IsDead, BlueprintReadOnly, Category = "Health")
	bool bIsDead = false;

	UFUNCTION()
	void HandleAnyDamage(AActor* DamagedActor, float Damage, const UDamageType* DamageType, AController* InstigatedBy, AActor* DamageCauser);

	UFUNCTION()
	void OnRep_Health();

	UFUNCTION()
	void OnRep_IsDead();

private:
	void Die(AController* Killer);
};
