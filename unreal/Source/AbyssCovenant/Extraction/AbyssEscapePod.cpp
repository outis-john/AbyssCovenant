#include "Extraction/AbyssEscapePod.h"
#include "Core/AbyssGameState.h"
#include "Core/AbyssGameMode.h"
#include "AbyssCovenant.h"
#include "Net/UnrealNetwork.h"
#include "Engine/World.h"

AAbyssEscapePod::AAbyssEscapePod()
{
	PrimaryActorTick.bCanEverTick = false;
	bReplicates = true;
	bAlwaysRelevant = true; // 逃生舱状态所有人都要知道，不管离得多远
}

void AAbyssEscapePod::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);
	DOREPLIFETIME(AAbyssEscapePod, Thrusters);
	DOREPLIFETIME(AAbyssEscapePod, Fuel);
	DOREPLIFETIME(AAbyssEscapePod, Hull);
	DOREPLIFETIME(AAbyssEscapePod, bLaunched);
}

void AAbyssEscapePod::AddPart(EPodPart Part)
{
	if (bLaunched)
	{
		return;
	}
	switch (Part)
	{
	case EPodPart::Thruster: Thrusters = FMath::Min(Thrusters + 1, ThrustersNeeded); break;
	case EPodPart::Fuel:     Fuel = FMath::Min(Fuel + 1, FuelNeeded); break;
	case EPodPart::Hull:     Hull = FMath::Min(Hull + 1, HullNeeded); break;
	}
	OnPartsChanged(); // 服务器本地也触发
}

bool AAbyssEscapePod::IsAssembled() const
{
	return Thrusters >= ThrustersNeeded && Fuel >= FuelNeeded && Hull >= HullNeeded;
}

bool AAbyssEscapePod::CanLaunch() const
{
	const AAbyssGameState* GS = GetWorld() ? GetWorld()->GetGameState<AAbyssGameState>() : nullptr;
	return !bLaunched && IsAssembled() && GS && GS->AreAllConditionsComplete();
}

bool AAbyssEscapePod::TryLaunch()
{
	if (!HasAuthority() || !CanLaunch())
	{
		return false;
	}

	bLaunched = true;
	OnLaunched();

	// 目前：发射即撤离成功。以后可以只算 BoardingRadius 内的玩家，并把他们的物资存进战舰
	if (AAbyssGameMode* GM = GetWorld()->GetAuthGameMode<AAbyssGameMode>())
	{
		GM->EndMatchAndReturnToLobby(true, 8.f);
	}

	UE_LOG(LogAbyss, Log, TEXT("Escape pod launched"));
	return true;
}

void AAbyssEscapePod::OnRep_Parts()
{
	OnPartsChanged();
}

void AAbyssEscapePod::OnRep_Launched()
{
	if (bLaunched)
	{
		OnLaunched();
	}
}
