#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AbyssPlayerActionsComponent.generated.h"

class AAbyssEscapePod;

/**
 * Player actions that must go through the host: calling a recovery beacon, launching the pod.
 * Add it to the player character and call these from input events.
 */
UCLASS(ClassGroup = (Abyss), meta = (BlueprintSpawnableComponent))
class ABYSSCOVENANT_API UAbyssPlayerActionsComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAbyssPlayerActionsComponent();

	/** Max distance from the pod to press the launch button. */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Actions")
	float InteractRange = 400.f;

	UFUNCTION(BlueprintCallable, Category = "Actions")
	void CallRecovery();

	UFUNCTION(BlueprintCallable, Category = "Actions")
	void TryLaunchPod(AAbyssEscapePod* Pod);

protected:
	UFUNCTION(Server, Reliable)
	void Server_CallRecovery();

	UFUNCTION(Server, Reliable)
	void Server_TryLaunchPod(AAbyssEscapePod* Pod);
};
