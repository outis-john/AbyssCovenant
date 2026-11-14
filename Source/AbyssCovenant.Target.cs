using UnrealBuildTool;
using System.Collections.Generic;

public class AbyssCovenantTarget : TargetRules
{
	public AbyssCovenantTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.Latest;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("AbyssCovenant");
	}
}
