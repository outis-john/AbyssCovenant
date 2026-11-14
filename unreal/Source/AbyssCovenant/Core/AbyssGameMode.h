#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "AbyssGameMode.generated.h"

/**
 * Server-only match rules.
 * - Rolls the map seed and 1-2 hidden extraction conditions at match start
 * - Announces players who join mid-match
 * - Updates extraction conditions when enemies die
 * - Ends the match on extraction or team wipe and travels back to the lobby
 *
 * Usage: create a Blueprint child (BP_AbyssGameMode) and set Default Pawn Class to your character Blueprint.
 */
UCLASS()
class ABYSSCOVENANT_API AAbyssGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AAbyssGameMode();

	/** Lobby map to return to. Keep "?listen" so the host keeps hosting. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Match")
	FString LobbyMapURL = TEXT("/Game/Maps/Lobby?listen");

	/** Broadcast when someone joins mid-match. {0} = player name. Translate this in the Blueprint. */
	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Match")
	FText JoinMessageFormat = NSLOCTEXT("Abyss", "JoinMessage", "Orbital drop signal confirmed - {0} has joined the fight.");

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Extraction")
	int32 MinConditions = 1;

	UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category = "Extraction")
	int32 MaxConditions = 2;

	/** Called by the health component when an enemy dies. */
	void NotifyEnemyKilled(bool bElite);

	/** Called by the health component when a player dies. Ends the match if the whole squad is down. */
	void NotifyPlayerDied();

	/** End the match and travel everyone back to the lobby after Delay seconds. */
	UFUNCTION(BlueprintCallable, Category = "Match")
	void EndMatchAndReturnToLobby(bool bExtracted, float Delay = 5.f);

	/** Implement in Blueprint: spawn room modules from the seed. Room actors must have Replicates enabled. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Match")
	void BuildMapFromSeed(int32 Seed);

	/** Implement in Blueprint: show the results screen. */
	UFUNCTION(BlueprintImplementableEvent, Category = "Match")
	void OnMatchEnded(bool bExtracted);

protected:
	virtual void InitGameState() override;
	virtual void BeginPlay() override;
	virtual void PostLogin(APlayerController* NewPlayer) override;

private:
	void RollExtractionConditions();
	FTimerHandle ReturnTimer;
	bool bMatchEnded = false;
};
