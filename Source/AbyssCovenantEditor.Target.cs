using UnrealBuildTool;
using System.Collections.Generic;

public class AbyssCovenantEditorTarget : TargetRules
{
	public AbyssCovenantEditorTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Editor;
		DefaultBuildSettings = BuildSettingsVersion.Latest;
		IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
		ExtraModuleNames.Add("AbyssCovenant");
	}
}
