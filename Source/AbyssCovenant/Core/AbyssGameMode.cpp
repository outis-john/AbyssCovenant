#include "Core/AbyssGameMode.h"
#include "Core/AbyssGameState.h"
#include "Combat/AbyssHealthComponent.h"
#include "AbyssCovenant.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/PlayerState.h"
#include "Engine/World.h"
#include "TimerManager.h"

AAbyssGameMode::AAbyssGameMode()
{
	GameStateClass = AAbyssGameState::StaticClass();
	bUseSeamlessTravel = true; // 回大厅时不断开连接
}

void AAbyssGameMode::InitGameState()
{
	Super::InitGameState();

	if (AAbyssGameState* GS = GetGameState<AAbyssGameState>())
	{
		GS->MapSeed = FMath::Rand();
		GS->RecoveryCallsLeft = 2;
		RollExtractionConditions();
	}
}

void AAbyssGameMode::BeginPlay()
{
	Super::BeginPlay();

	if (AAbyssGameState* GS = GetGameState<AAbyssGameState>())
	{
		// 蓝图根据种子拼接房间模块（房间 Actor 需要勾选 Replicates，客户端才看得到）
		BuildMapFromSeed(GS->MapSeed);
	}
}

void AAbyssGameMode::RollExtractionConditions()
{
	AAbyssGameState* GS = GetGameState<AAbyssGameState>();
	if (!GS)
	{
		return;
	}

	// 用地图种子做随机，保证同一个种子永远得到同样的条件（方便测试和复现 bug）
	FRandomStream Rng(GS->MapSeed);

	TArray<EExtractionConditionType> Pool = {
		EExtractionConditionType::KillCount,
		EExtractionConditionType::EliteKill,
		EExtractionConditionType::HackTerminal,
		EExtractionConditionType::PsykerRitual,
		EExtractionConditionType::PowerCores
	};

	// 洗牌
	for (int32 i = Pool.Num() - 1; i > 0; --i)
	{
		Pool.Swap(i, Rng.RandRange(0, i));
	}

	const int32 Count = Rng.RandRange(FMath::Max(1, MinConditions), FMath::Max(MinConditions, MaxConditions));

	GS->Conditions.Reset();
	for (int32 i = 0; i < Count && i < Pool.Num(); ++i)
	{
		FExtractionCondition C;
		C.Type = Pool[i];
		C.bRevealed = false; // 开局隐藏，要靠线索发现
		C.Progress = 0;
		switch (C.Type)
		{
		case EExtractionConditionType::KillCount:    C.Target = 30; break;
		case EExtractionConditionType::EliteKill:    C.Target = 1;  break;
		case EExtractionConditionType::HackTerminal: C.Target = 1;  break;
		case EExtractionConditionType::PsykerRitual: C.Target = 1;  break;
		case EExtractionConditionType::PowerCores:   C.Target = 3;  break;
		}
		GS->Conditions.Add(C);
	}

	UE_LOG(LogAbyss, Log, TEXT("Match seed %d, %d extraction condition(s) rolled"), GS->MapSeed, GS->Conditions.Num());
}

void AAbyssGameMode::PostLogin(APlayerController* NewPlayer)
{
	Super::PostLogin(NewPlayer);

	// 房主自己进来不广播；之后每个加入的人都广播
	if (GetNumPlayers() > 1)
	{
		if (AAbyssGameState* GS = GetGameState<AAbyssGameState>())
		{
			const FString Name = NewPlayer && NewPlayer->PlayerState ? NewPlayer->PlayerState->GetPlayerName() : FString();
			GS->Multicast_Announce(FText::Format(JoinMessageFormat, FText::FromString(Name)));
		}
	}
}

void AAbyssGameMode::NotifyEnemyKilled(bool bElite)
{
	if (AAbyssGameState* GS = GetGameState<AAbyssGameState>())
	{
		GS->AddConditionProgress(EExtractionConditionType::KillCount, 1);
		if (bElite)
		{
			GS->AddConditionProgress(EExtractionConditionType::EliteKill, 1);
		}
	}
}

void AAbyssGameMode::NotifyPlayerDied()
{
	// 检查是否全队阵亡
	for (FConstPlayerControllerIterator It = GetWorld()->GetPlayerControllerIterator(); It; ++It)
	{
		const APlayerController* PC = It->Get();
		const APawn* Pawn = PC ? PC->GetPawn() : nullptr;
		const UAbyssHealthComponent* Health = Pawn ? Pawn->FindComponentByClass<UAbyssHealthComponent>() : nullptr;
		if (Health && !Health->IsDead())
		{
			return; // 还有人活着
		}
	}
	UE_LOG(LogAbyss, Log, TEXT("Squad wiped"));
	EndMatchAndReturnToLobby(false, 5.f);
}

void AAbyssGameMode::EndMatchAndReturnToLobby(bool bExtracted, float Delay)
{
	if (bMatchEnded)
	{
		return;
	}
	bMatchEnded = true;
	OnMatchEnded(bExtracted);

	GetWorldTimerManager().SetTimer(ReturnTimer, FTimerDelegate::CreateWeakLambda(this, [this]()
	{
		GetWorld()->ServerTravel(LobbyMapURL);
	}), FMath::Max(0.1f, Delay), false);
}
