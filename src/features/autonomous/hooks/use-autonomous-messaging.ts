import { useCallback } from "react";

export function useAutonomousMessaging(
  _chatId: string,
  _autonomousEnabled: boolean,
  _exchangesEnabled: boolean,
  _onAutonomousMessage: (characterId: string) => void,
) {
  return {
    recordUserActivity: useCallback(() => {
      return;
    }, []),
  };
}
