import { useMe } from "@nadaena/api-client";
import { SettingsView } from "@/domains/user/SettingsView";
import { QueryState } from "@/shared/ui/QueryState";
import { Screen } from "@/shared/ui/Screen";

export default function SettingsScreen() {
  const me = useMe();

  return (
    <Screen>
      <QueryState data={me.data} isLoading={me.isLoading} error={me.error} onRetry={() => me.refetch()}>
        {(profile) => <SettingsView me={profile} />}
      </QueryState>
    </Screen>
  );
}
