import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

interface ContractSize {
  name: string;
  size: number;
  sizeKB: string;
}

function getContractSizes(dir: string, contractSizes: ContractSize[] = []): ContractSize[] {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getContractSizes(filePath, contractSizes);
    } else if (file.endsWith(".json") && file !== "artifacts.d.ts") {
      try {
        const content = readFileSync(filePath, "utf-8");
        const artifact = JSON.parse(content);

        if (artifact.bytecode && artifact.bytecode !== "0x") {
          const bytecodeSize = (artifact.bytecode.length - 2) / 2; // Remove '0x' and divide by 2
          contractSizes.push({
            name: artifact.contractName || file.replace(".json", ""),
            size: bytecodeSize,
            sizeKB: (bytecodeSize / 1024).toFixed(2),
          });
        }
      } catch {
        // Skip invalid JSON files
      }
    }
  }

  return contractSizes;
}

function main() {
  const artifactsDir = join(process.cwd(), "artifacts", "contracts");

  try {
    const contractSizes = getContractSizes(artifactsDir);

    // Sort by size descending
    contractSizes.sort((a, b) => b.size - a.size);

    console.log("\n┌─────────────────────────────────────────────────────────────┐");
    console.log("│                     Contract Sizes                          │");
    console.log("├─────────────────────────────────────────────────────────────┤");
    console.log("│ Contract Name                    │ Size (KB) │ Size (bytes) │");
    console.log("├──────────────────────────────────┼───────────┼──────────────┤");

    for (const contract of contractSizes) {
      const maxSize = 24576; // 24 KB limit
      const warning = contract.size > maxSize ? " ⚠️  EXCEEDS LIMIT" : "";

      console.log(
        `│ ${contract.name.padEnd(32)} │ ${contract.sizeKB.padStart(9)} │ ${contract.size.toString().padStart(12)} │${warning}`,
      );
    }

    console.log("└──────────────────────────────────┴───────────┴──────────────┘");
    console.log(`\nTotal contracts: ${contractSizes.length}`);
    console.log("Maximum contract size: 24.00 KB (24576 bytes)\n");
  } catch {
    console.error("Error: Could not find artifacts. Please compile contracts first.");
    console.error("Run: pnpm compile");
    process.exit(1);
  }
}

main();
