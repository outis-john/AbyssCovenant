#include "Core/AbyssGameState.h"
#include "AbyssCovenant.h"
#include "Net/UnrealNetwork.h"

void AAbyssGameState::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(AAbyssGameState, MapSeed);
	DOREPLIFETIME(AAbyssGameState, Conditions);
	DOREPLIFETIME(AAbyssGameState, RecoveryCallsLeft);
}

void AAbyssGameState::AddConditionProgress(EExtractionConditionType Type, int32 Amount)
{
	bool bChanged = false;
	for (FExtractionCondition& C : Conditions)
	{
		if (C.Type == Type && !C.IsComplete())
		{
			C.Progress = FMath::Min(C.Progress + Amount, C.Target);
			bChanged = true;
		}
	}
	if (bChanged)
	{
		OnConditionsChanged.Broadcast(); // 服务器本地也刷新 UI
	}
}

bool AAbyssGameState::RevealNextHiddenCondition()
{
	for (FExtractionCondition& C : Conditions)
	{
		if (!C.bRevealed)
		{
			C.bRevealed = true;
			OnConditionsChanged.Broadcast();
			return true;
		}
	}
	return false;
}

bool AAbyssGameState::AreAllConditionsComplete() const
{
	if (Conditions.Num() == 0)
	{
		return false;
	}
	for (const FExtractionCondition& C : Conditions)
	{
		if (!C.IsComplete())
		{
			return false;
		}
	}
	return true;
}

bool AAbyssGameState::TryUseRecovery(FVector Location)
{
	if (RecoveryCallsLeft <= 0)
	{
		return false;
	}
	--RecoveryCallsLeft;
	Multicast_RecoveryCalled(Location);
	return true;
}

void AAbyssGameState::Multicast_RecoveryCalled_Implementation(FVector_NetQuantize Location)
{
	OnRecoveryCalled.Broadcast(Location);
}

void AAbyssGameState::Multicast_Announce_Implementation(const FText& Message)
{
	OnAnnouncement.Broadcast(Message);
}

void AAbyssGameState::OnRep_Conditions()
{
	OnConditionsChanged.Broadcast();
}
