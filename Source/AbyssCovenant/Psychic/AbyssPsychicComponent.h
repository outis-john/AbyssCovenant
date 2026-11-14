#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Engine/NetSerialization.h"
#include "Psychic/AbyssPsychicTypes.h"
#include "AbyssPsychicComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FAbyssOnSpellCast, const FPsychicSpell&, Spell, FVector, Start, FVector, End);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FAbyssOnBacklash, EBacklashTier, Tier, FVector, Location);

/**
 * Psychic core. Add it to the player character.
 *
 * - Mana: spent on casts, regenerates.
 * - Overload: rises with every cast, slowly decays. Casting without enough mana is allowed,
 *   but the missing mana is added to overload twice over. Overload above max = backlash.
 * - Tidecaller: +1 rune slot, 30% higher overload cap, chance to resist backlash.
 *
 * Bolt and Blast deal damage in C++. Shield, Summon and Homing are built in Blueprint via OnSpellCast.
 */
UCLASS(ClassGroup = (Abyss), meta = (BlueprintSpawnableComponent))
class ABYSSCOVENANT_API UAbyssPsychicComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAbyssPsychicComponent();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	bool bIsTidecaller = false;

	/** Rune slots on the equipped core (basic 3, advanced 5). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	int32 CoreSlots = 3;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	float MaxMana = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	float ManaRegenPerSecond = 8.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	float MaxOverload = 100.f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	float OverloadDecayPerSecond = 4.f;

	/** Overload gained per point of mana spent. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	float OverloadPerManaSpent = 0.6f;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Psychic")
	float TidecallerBacklashIgnoreChance = 0.25f;

	/** Equipped spells. Set them in the character Blueprint (later: from the rune UI). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Replicated, Category = "Psychic")
	TArray<FPsychicSpell> EquippedSpells;

	/** Local player casts spell number SpellIndex. */
	UFUNCTION(BlueprintCallable, Category = "Psychic")
	void CastSpell(int32 SpellIndex);

	/** Does this spell fit in the current core? */
	UFUNCTION(BlueprintPure, Category = "Psychic")
	bool CanEquip(const FPsychicSpell& Spell) const;

	UFUNCTION(BlueprintPure, Category = "Psychic")
	float GetManaCost(const FPsychicSpell& Spell) const;

	UFUNCTION(BlueprintPure, Category = "Psychic")
	float GetMana() const { return Mana; }

	UFUNCTION(BlueprintPure, Category = "Psychic")
	float GetOverload() const { return Overload; }

	/** 0..1. Drive whisper audio and screen warp with it: whispers above 0.5, heartbeat above 0.8. */
	UFUNCTION(BlueprintPure, Category = "Psychic")
	float GetOverloadRatio() const;

	/** Everyone: play spell effects. Build Shield / Summon / Homing projectiles here. */
	UPROPERTY(BlueprintAssignable, Category = "Psychic")
	FAbyssOnSpellCast OnSpellCast;

	/** Everyone: a backlash happened. On Severe, spawn demons here (server side). */
	UPROPERTY(BlueprintAssignable, Category = "Psychic")
	FAbyssOnBacklash OnBacklash;

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

protected:
	virtual void BeginPlay() override;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Psychic")
	float Mana = 100.f;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Psychic")
	float Overload = 0.f;

	UFUNCTION(Server, Reliable)
	void Server_CastSpell(int32 SpellIndex, FVector_NetQuantize Start, FVector_NetQuantizeNormal Direction);

	UFUNCTION(NetMulticast, Unreliable)
	void Multicast_SpellFX(const FPsychicSpell& Spell, FVector_NetQuantize Start, FVector_NetQuantize End);

	UFUNCTION(NetMulticast, Reliable)
	void Multicast_Backlash(EBacklashTier Tier, FVector_NetQuantize Location);

private:
	int32 GetTotalSlots() const;
	float GetElementMultiplier(ERuneElement Element) const;
	float GetBaseDamage(ERuneForm Form) const;

	void ExecuteSpell(const FPsychicSpell& Spell, const FVector& Start, const FVector& Direction);
	void ExecuteSingleCast(const FPsychicSpell& Spell, const FVector& Start, const FVector& Direction, float DamageScale);
	void TriggerBacklash();
};
