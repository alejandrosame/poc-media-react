{
  inputs.dream2nix.url = "github:nix-community/dream2nix";
  outputs = {
    self,
    dream2nix,
  }: let
    nixpkgs = dream2nix.inputs.nixpkgs;
    l = nixpkgs.lib // builtins;

    systems = ["x86_64-linux"];
    forAllSystems = f:
      l.genAttrs systems (
        system:
          f system (nixpkgs.legacyPackages.${system})
      );

    d2n-flake = dream2nix.lib.makeFlakeOutputs {
      inherit systems;
      config.projectRoot = ./.;
      source = ./.;
      settings = [
        {
          subsystemInfo.nodejs = 18;
        }
      ];
    };
  in
    dream2nix.lib.dlib.mergeFlakes [
      d2n-flake
      {
        devShells = forAllSystems (system: pkgs: {
          default = d2n-flake.devShells.${system}.default.overrideAttrs (old: {
            buildInputs =
              old.buildInputs
              ++ (with pkgs; [
                treefmt
                tree
                miniserve
              ]);
          });
        });
      }
    ];
}
