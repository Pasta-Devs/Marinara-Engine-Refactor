// ──────────────────────────────────────────────
// ModalRenderer: Maps store modal types → components
// ──────────────────────────────────────────────
import { lazy, Suspense } from "react";
import { useUIStore } from "../../shared/stores/ui.store";
import type { AgentData } from "../../features/agents/components/EditAgentModal";

const CreateCharacterModal = lazy(() =>
  import("../../features/characters/components/CreateCharacterModal").then((module) => ({ default: module.CreateCharacterModal })),
);
const ImportCharacterModal = lazy(() =>
  import("../../features/characters/components/ImportCharacterModal").then((module) => ({ default: module.ImportCharacterModal })),
);
const CharacterMakerModal = lazy(() =>
  import("../../features/characters/components/CharacterMakerModal").then((module) => ({ default: module.CharacterMakerModal })),
);
const CreateLorebookModal = lazy(() =>
  import("../../features/lorebooks/components/CreateLorebookModal").then((module) => ({ default: module.CreateLorebookModal })),
);
const ImportLorebookModal = lazy(() =>
  import("../../features/lorebooks/components/ImportLorebookModal").then((module) => ({ default: module.ImportLorebookModal })),
);
const LorebookMakerModal = lazy(() =>
  import("../../features/lorebooks/components/LorebookMakerModal").then((module) => ({ default: module.LorebookMakerModal })),
);
const CreatePresetModal = lazy(() =>
  import("../../features/presets/components/CreatePresetModal").then((module) => ({ default: module.CreatePresetModal })),
);
const ImportPresetModal = lazy(() =>
  import("../../features/presets/components/ImportPresetModal").then((module) => ({ default: module.ImportPresetModal })),
);
const EditAgentModal = lazy(() =>
  import("../../features/agents/components/EditAgentModal").then((module) => ({ default: module.EditAgentModal })),
);
const STBulkImportModal = lazy(() =>
  import("../../features/imports/components/STBulkImportModal").then((module) => ({ default: module.STBulkImportModal })),
);
const ImportPersonaModal = lazy(() =>
  import("../../features/personas/components/ImportPersonaModal").then((module) => ({ default: module.ImportPersonaModal })),
);
const PersonaMakerModal = lazy(() =>
  import("../../features/personas/components/PersonaMakerModal").then((module) => ({ default: module.PersonaMakerModal })),
);
const CreateConnectionModal = lazy(() =>
  import("../../features/connections/components/CreateConnectionModal").then((module) => ({ default: module.CreateConnectionModal })),
);
const CreatePersonaModal = lazy(() =>
  import("../../features/personas/components/CreatePersonaModal").then((module) => ({ default: module.CreatePersonaModal })),
);
const CharacterCardUpdateModal = lazy(() =>
  import("../../features/characters/components/CharacterCardUpdateModal").then((module) => ({ default: module.CharacterCardUpdateModal })),
);

export function ModalRenderer() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);

  const type = modal?.type ?? null;
  if (!type) return null;

  let content = null;
  switch (type) {
    case "create-character":
      content = <CreateCharacterModal open onClose={closeModal} />;
      break;
    case "import-character":
      content = <ImportCharacterModal open onClose={closeModal} />;
      break;
    case "character-maker":
      content = <CharacterMakerModal open onClose={closeModal} />;
      break;
    case "create-lorebook":
      content = <CreateLorebookModal open onClose={closeModal} />;
      break;
    case "import-lorebook":
      content = <ImportLorebookModal open onClose={closeModal} />;
      break;
    case "lorebook-maker":
      content = <LorebookMakerModal open onClose={closeModal} />;
      break;
    case "create-preset":
      content = <CreatePresetModal open onClose={closeModal} />;
      break;
    case "import-preset":
      content = <ImportPresetModal open onClose={closeModal} />;
      break;
    case "edit-agent":
      content = <EditAgentModal open onClose={closeModal} agent={(modal?.props?.agent as AgentData | null) ?? null} />;
      break;
    case "import-persona":
      content = <ImportPersonaModal open onClose={closeModal} />;
      break;
    case "persona-maker":
      content = <PersonaMakerModal open onClose={closeModal} />;
      break;
    case "create-connection":
      content = <CreateConnectionModal open onClose={closeModal} />;
      break;
    case "create-persona":
      content = <CreatePersonaModal open onClose={closeModal} />;
      break;
    case "st-bulk-import":
      content = <STBulkImportModal open onClose={closeModal} />;
      break;
    case "character-card-update":
      content = <CharacterCardUpdateModal open onClose={closeModal} />;
      break;
    default:
      content = null;
  }

  return <Suspense fallback={null}>{content}</Suspense>;
}
