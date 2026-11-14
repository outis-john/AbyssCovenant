#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameStateBase.h"
#include "Engine/NetSerialization.h"
#include "Extraction/AbyssExtractionTypes.h"
#include "AbyssGameState.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FAbyssOnConditionsChanged);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FAbyssOnAnnouncement, const FText&, Message);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FAbyssOnRecoveryCalled, FVector, Location);

/**
 * Match-wide state, replicated to every player:
 * map seed, extraction conditions, recovery beacon charges.
 */
UCLASS()
class ABYSSCOVENANT_API AAbyssGameState : public AGameStateBase
{
	GENERATED_BODY()

public:
	/** Map seed. Late joiners can rebuild the same random map from it. */
	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Match")
	int32 MapSeed = 0;

	UPROPERTY(ReplicatedUsing = OnRep_Conditions, BlueprintReadOnly, Category = "Extraction")
	TArray<FExtractionCondition> Conditions;

	/** Recovery beacon (balloon) charges left this match. */
	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Extraction")
	int32 RecoveryCallsLeft = 2;

	/** Server: add progress to every condition of this type. */
	UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Extraction")
	void AddConditionProgress(EExtractionConditionType Type, int32 Amount = 1);

	/** Server: a clue was found, reveal the next hidden condition. Returns true if one was revealed. */
	UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Extraction")
	bool RevealNextHiddenCondition();

	/** Server: use one recovery charge. Returns false if none are left. */
	UFUNCTION(BlueprintCallable, BlueprintAuthorityOnly, Category = "Extraction")
	bool TryUseRecovery(FVector Location);

	UFUNCTION(BlueprintPure, Category = "Extraction")
	bool AreAllConditionsComplete() const;

	/** Show a message to every player. */
	UFUNCTION(NetMulticast, Reliable, BlueprintCallable, Category = "Match")
	void Multicast_Announce(const FText& Message);

	UPROPERTY(BlueprintAssignable, Category = "Extraction")
	FAbyssOnConditionsChanged OnConditionsChanged;

	UPROPERTY(BlueprintAssignable, Category = "Match")
	FAbyssOnAnnouncement OnAnnouncement;

	/** Everyone: a recovery beacon was called. In Blueprint: balloon effect, send loot, spawn an enemy wave. */
	UPROPERTY(BlueprintAssignable, Category = "Extraction")
	FAbyssOnRecoveryCalled OnRecoveryCalled;

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

protected:
	UFUNCTION()
	void OnRep_Conditions();

	UFUNCTION(NetMulticast, Reliable)
	void Multicast_RecoveryCalled(FVector_NetQuantize Location);
};
