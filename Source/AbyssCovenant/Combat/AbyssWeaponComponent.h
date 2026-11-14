#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Engine/EngineTypes.h"
#include "Engine/NetSerialization.h"
#include "AbyssWeaponComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FAbyssOnLocalFire);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FAbyssOnFireFX, FVector, Start, FVector, End, bool, bHit);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FAbyssOnHitConfirmed, bool, bKilled, bool, bWeakPoint);

/**
 * Networked hitscan weapon. Add it to the player character.
 *
 * Flow (host is authoritative):
 *  1. Local player calls Fire(): recoil + muzzle flash play instantly (no network wait)
 *  2. Server_Fire: tells the host where the shot came from and which way it went
 *  3. Host traces and applies damage
 *  4. Multicast_FireFX: everyone plays tracer / impact effects
 *  5. Client_HitConfirmed: only the shooter gets the hit marker / kill sound
 */
UCLASS(ClassGroup = (Abyss), meta = (BlueprintSpawnableComponent))
class ABYSSCOVENANT_API UAbyssWeaponComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAbyssWeaponComponent();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float Damage = 20.f;

	/** Damage multiplier when the hit bone name contains "head". */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float WeakPointMultiplier = 2.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float Range = 10000.f;

	/** Shots per second. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float FireRate = 8.f;

	/** Trace channel. If shots pass through enemies, make their mesh/capsule Block this channel. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	TEnumAsByte<ECollisionChannel> TraceChannel = ECC_Visibility;

	/** Upward kick per shot (degrees). Heavy weapons: high. Light weapons: low. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon|Recoil")
	float RecoilPitch = 0.6f;

	/** Random sideways kick per shot (degrees). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon|Recoil")
	float RecoilYawRandom = 0.3f;

	/** Call every frame while the trigger is held; fire rate is enforced internally. */
	UFUNCTION(BlueprintCallable, Category = "Weapon")
	void Fire();

	/** Local shooter only: muzzle flash, gunshot sound, camera shake. */
	UPROPERTY(BlueprintAssignable, Category = "Weapon")
	FAbyssOnLocalFire OnLocalFire;

	/** Everyone: tracer, bullet hole, blood. */
	UPROPERTY(BlueprintAssignable, Category = "Weapon")
	FAbyssOnFireFX OnFireFX;

	/** Shooter only: hit marker + hit sound; bKilled = play kill sound. */
	UPROPERTY(BlueprintAssignable, Category = "Weapon")
	FAbyssOnHitConfirmed OnHitConfirmed;

protected:
	UFUNCTION(Server, Reliable)
	void Server_Fire(FVector_NetQuantize Start, FVector_NetQuantizeNormal Direction);

	UFUNCTION(NetMulticast, Unreliable)
	void Multicast_FireFX(FVector_NetQuantize Start, FVector_NetQuantize End, bool bHit);

	UFUNCTION(Client, Unreliable)
	void Client_HitConfirmed(bool bKilled, bool bWeakPoint);

private:
	void ApplyLocalRecoil();

	float LastLocalFireTime = -1000.f;
	float LastServerFireTime = -1000.f;
};
