import { formDataToJson } from "./file-payload";
import { invokeTauri } from "./tauri-client";

export interface ImportFilePayload {
  file: File;
  fields?: Record<string, string | number | boolean | null | undefined>;
}

export async function importJson<T>(path: string, payload: unknown): Promise<T> {
  return invokeImportCommand(path, payload);
}

export async function importFile<T>(path: string, payload: ImportFilePayload | File): Promise<T> {
  const file = payload instanceof File ? payload : payload.file;
  const fields = payload instanceof File ? undefined : payload.fields;
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (value !== null && value !== undefined) formData.append(key, String(value));
  }
  formData.append("file", file, file.name);
  return invokeImportCommand<T>(path, await formDataToJson(formData));
}

function invokeImportCommand<T>(path: string, payload: unknown): Promise<T> {
  switch (path) {
    case "/import/marinara":
      return invokeTauri<T>("import_marinara", { envelope: payload });
    case "/import/marinara-file":
      return invokeTauri<T>("import_marinara_file", { body: payload });
    case "/import/st-character":
      return invokeTauri<T>("import_st_character", { body: payload });
    case "/import/st-character/batch":
      return invokeTauri<T>("import_st_character_batch", { body: payload });
    case "/import/st-character/inspect":
      return invokeTauri<T>("import_st_character_inspect", { body: payload });
    case "/import/st-chat":
      return invokeTauri<T>("import_st_chat", { body: payload });
    case "/import/st-chat-into-group":
      return invokeTauri<T>("import_st_chat_into_group", { body: payload });
    case "/import/st-preset":
      return invokeTauri<T>("import_st_preset", { payload });
    case "/import/st-lorebook":
      return invokeTauri<T>("import_st_lorebook", { payload });
    case "/import/st-bulk/scan":
      return invokeTauri<T>("import_st_bulk_scan", { payload });
    case "/import/st-bulk/run":
      return invokeTauri<T>("import_st_bulk_run", { payload });
    case "/import/list-directory": {
      const input = payload && typeof payload === "object" ? (payload as { path?: unknown }) : {};
      return invokeTauri<T>("import_list_directory", { path: typeof input.path === "string" ? input.path : "" });
    }
    default:
      throw new Error(`Unknown import command: ${path}`);
  }
}

export const importApi = {
  marinara: <T>(envelope: unknown) => importJson<T>("/import/marinara", envelope),
  marinaraFile: <T>(file: File) => importFile<T>("/import/marinara-file", file),
  stCharacterJson: <T>(payload: unknown) => importJson<T>("/import/st-character", payload),
  stCharacterFile: <T>(payload: ImportFilePayload) => importFile<T>("/import/st-character", payload),
  stCharacterBatch: <T>(payload: ImportFilePayload | File[] | FormData) => {
    if (payload instanceof FormData) {
      return formDataToJson(payload).then((body) => invokeImportCommand<T>("/import/st-character/batch", body));
    }
    if (Array.isArray(payload)) {
      const form = new FormData();
      payload.forEach((file) => form.append("files", file, file.name));
      return formDataToJson(form).then((body) => invokeImportCommand<T>("/import/st-character/batch", body));
    }
    return importFile<T>("/import/st-character/batch", payload);
  },
  stCharacterInspect: <T>(payload: File[] | FormData) => {
    const form = payload instanceof FormData ? payload : new FormData();
    if (Array.isArray(payload)) payload.forEach((file) => form.append("files", file, file.name));
    return formDataToJson(form).then((body) => invokeImportCommand<T>("/import/st-character/inspect", body));
  },
  stChat: <T>(file: File) => importFile<T>("/import/st-chat", file),
  stChatIntoGroup: <T>(chatId: string, file: File) =>
    importFile<T>("/import/st-chat-into-group", { file, fields: { chatId } }),
  stPreset: <T>(payload: unknown) => importJson<T>("/import/st-preset", payload),
  stLorebook: <T>(payload: unknown) => importJson<T>("/import/st-lorebook", payload),
  stBulkScan: <T>(payload: unknown) => importJson<T>("/import/st-bulk/scan", payload),
  stBulkRun: <T>(payload: unknown) => importJson<T>("/import/st-bulk/run", payload),
  stBulkRunEvents: async function* (
    payload: unknown,
    signal?: AbortSignal,
  ): AsyncGenerator<{ type: string; data: unknown }> {
    if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
    const events = await invokeTauri<Array<{ type?: unknown; data?: unknown; text?: unknown; [key: string]: unknown }>>(
      "import_st_bulk_run_events",
      { payload },
    );
    for (const event of events) {
      if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
      const type = typeof event.type === "string" ? event.type : "message";
      yield { type, data: "data" in event ? event.data : "text" in event ? event.text : event };
    }
  },
  listDirectory: <T>(path: string) => importJson<T>("/import/list-directory", { path }),
};
