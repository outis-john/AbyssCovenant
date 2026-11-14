#pragma once

#include "CoreMinimal.h"
#include "AbyssExtractionTypes.generated.h"

/** Extraction condition. 1-2 are rolled per match and start hidden. */
UENUM(BlueprintType)
enum class EExtractionConditionType : uint8
{
	KillCount,     // kill N enemies
	EliteKill,     // kill an elite
	HackTerminal,  // hack a golden-age terminal (puzzle)
	PsykerRitual,  // escort a psyker through a ritual (hold the point)
	PowerCores     // collect power cores
};

USTRUCT(BlueprintType)
struct FExtractionCondition
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "Extraction")
	EExtractionConditionType Type = EExtractionConditionType::KillCount;

	/** Has the squad found the clue that reveals this condition? */
	UPROPERTY(BlueprintReadOnly, Category = "Extraction")
	bool bRevealed = false;

	UPROPERTY(BlueprintReadOnly, Category = "Extraction")
	int32 Progress = 0;

	UPROPERTY(BlueprintReadOnly, Category = "Extraction")
	int32 Target = 1;

	bool IsComplete() const { return Progress >= Target; }
};

/** Escape pod parts. */
UENUM(BlueprintType)
enum class EPodPart : uint8
{
	Thruster,
	Fuel,
	Hull
};
