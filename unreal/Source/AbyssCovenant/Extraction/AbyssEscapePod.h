#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Extraction/AbyssExtractionTypes.h"
#include "AbyssEscapePod.generated.h"

/**
 * The escape pod the squad builds to leave the planet.
 * Collect thrusters, fuel and hull parts, complete every extraction condition, then launch.
 *
 * Usage: create a Blueprint child, give it a mesh, and place it in the level.
 * Part pickups: on overlap (server side), call AddPart.
 */
UCLASS()
class ABYSSCOVENANT_API AAbyssEscapePod : public AActor
{
	GENERATED_BODY()

public:
	AAbyssEscapePod();

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pod")
	int32 ThrustersNeeded = 2;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pod")
	int32 FuelNeeded = 3;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pod")
	int32 HullNeeded = 1;

	/** Players within this distance of the pod at launch are extracted. */
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pod")
	float BoardingRadius = 600.f;

	/** Server: add one part. */
	UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Pod")
	void AddPart(EPodPart Part);

	UFUNCTION(BlueprintPure, Category = "Pod")
	bool IsAssembled() const;

	/** Assembled AND every extraction condition is complete. */
	UFUNCTION(BlueprintPure, Category = "Pod")
	bool CanLaunch() const;

	/** Server: launch if possible. Returns true on success. */
	UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Pod")
	bool TryLaunch();

	UFUNCTION(BlueprintPure, Category = "Pod")
	int32 GetThrusters() const { return Thrusters; }

	UFUNCTION(BlueprintPure, Category = "Pod")
	int32 GetFuel() const { return Fuel; }

	UFUNCTION(BlueprintPure, Category = "Pod")
	int32 GetHull() const { return Hull; }

	/** Every machine: parts changed (update the pod's look and the HUD). */
	UFUNCTION(BlueprintImplementableEvent, Category = "Pod")
	void OnPartsChanged();

	/** Every machine: the pod launched (play the launch sequence). */
	UFUNCTION(BlueprintImplementableEvent, Category = "Pod")
	void OnLaunched();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

protected:
	UPROPERTY(ReplicatedUsing = OnRep_Parts)
	int32 Thrusters = 0;

	UPROPERTY(ReplicatedUsing = OnRep_Parts)
	int32 Fuel = 0;

	UPROPERTY(ReplicatedUsing = OnRep_Parts)
	int32 Hull = 0;

	UPROPERTY(ReplicatedUsing = OnRep_Launched)
	bool bLaunched = false;

	UFUNCTION()
	void OnRep_Parts();

	UFUNCTION()
	void OnRep_Launched();
};
