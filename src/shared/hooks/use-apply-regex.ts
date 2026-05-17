export function useApplyRegex() {
  return {
    applyToAIOutput: (text: string, _options?: unknown) => text,
    applyToUserInput: (text: string, _options?: unknown) => text,
  };
}
