using UnrealBuildTool;

public class AbyssCovenant : ModuleRules
{
	public AbyssCovenant(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		// 让 "Combat/AbyssWeaponComponent.h" 这样的子文件夹路径可以直接 include
		PublicIncludePaths.Add(ModuleDirectory);

		PublicDependencyModuleNames.AddRange(new string[]
		{
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput"
		});
	}
}
