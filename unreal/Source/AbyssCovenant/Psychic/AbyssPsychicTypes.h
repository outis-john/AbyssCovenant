#pragma once

#include "CoreMinimal.h"
#include "AbyssPsychicTypes.generated.h"

/** Form rune: what the spell is. */
UENUM(BlueprintType)
enum class ERuneForm : uint8
{
	Bolt,
	Blast,
	Shield,
	Summon
};

/** Element rune: damage flavour and visual style. */
UENUM(BlueprintType)
enum class ERuneElement : uint8
{
	Fire,
	Lightning,
	Void,
	Mind
};

/** Modifier rune: changes how the spell behaves. */
UENUM(BlueprintType)
enum class ERuneModifier : uint8
{
	Homing,
	Split,
	Delayed
};

/** Overload backlash severity. */
UENUM(BlueprintType)
enum class EBacklashTier : uint8
{
	Minor,     // self damage, warped vision
	Moderate,  // explosion that also hurts teammates
	Severe     // tears a rift, demons spawn
};

/**
 * A spell assembled from runes.
 * Slots used = 1 (form) + 1 (element) + number of modifiers.
 * A basic core has 3 slots (one modifier). Tidecallers get +1 slot.
 */
USTRUCT(BlueprintType)
struct FPsychicSpell
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	ERuneForm Form = ERuneForm::Bolt;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	ERuneElement Element = ERuneElement::Fire;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	TArray<ERuneModifier> Modifiers;

	int32 GetSlotCost() const { return 2 + Modifiers.Num(); }
	bool HasModifier(ERuneModifier M) const { return Modifiers.Contains(M); }
};
