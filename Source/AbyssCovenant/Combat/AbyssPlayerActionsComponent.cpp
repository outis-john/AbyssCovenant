#include "Combat/AbyssPlayerActionsComponent.h"
#include "Core/AbyssGameState.h"
#include "Extraction/AbyssEscapePod.h"
#include "Engine/World.h"

UAbyssPlayerActionsComponent::UAbyssPlayerActionsComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
	SetIsReplicatedByDefault(true);
}

void UAbyssPlayerActionsComponent::CallRecovery()
{
	Server_CallRecovery();
}

void UAbyssPlayerActionsComponent::Server_CallRecovery_Implementation()
{
	AAbyssGameState* GS = GetWorld()->GetGameState<AAbyssGameState>();
	if (GS && GetOwner())
	{
		// 成功后所有人都会收到 OnRecoveryCalled：在蓝图里放气球、送走物资、刷一波敌人
		GS->TryUseRecovery(GetOwner()->GetActorLocation());
	}
}

void UAbyssPlayerActionsComponent::TryLaunchPod(AAbyssEscapePod* Pod)
{
	if (Pod)
	{
		Server_TryLaunchPod(Pod);
	}
}

void UAbyssPlayerActionsComponent::Server_TryLaunchPod_Implementation(AAbyssEscapePod* Pod)
{
	if (!Pod || !GetOwner())
	{
		return;
	}
	// 必须站在逃生舱旁边才能发射
	if (FVector::Dist(Pod->GetActorLocation(), GetOwner()->GetActorLocation()) > InteractRange)
	{
		return;
	}
	Pod->TryLaunch();
}
