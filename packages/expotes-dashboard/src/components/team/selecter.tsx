import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSDK } from "@/lib/api";
import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import { useEffect, useState } from "react";

export function TeamSelecterDialog() {
  const [open, setOpen] = useState(false);
  const { teamId, setTeamId } = usePersistStore();
  const { data: teams, isLoading } = useSDK(sdk.v1.team.list, []);

  const handleTeamChange = (teamId: string) => {
    const selectedTeam = teams?.find((team) => team.id === teamId);
    if (selectedTeam) {
      setTeamId(selectedTeam.id);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!teamId) {
      setOpen(true);
    }
  }, [teamId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Select Team</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a team</DialogTitle>
        </DialogHeader>
        <Select value={teamId || undefined} onValueChange={handleTeamChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogContent>
    </Dialog>
  );
}
