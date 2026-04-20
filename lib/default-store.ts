import { HouseholdStore } from "@/lib/types";
import { hashPin } from "@/lib/pin";

const today = new Date().toISOString().slice(0, 10);

export const defaultStore: HouseholdStore = {
  currency: "AUD",
  children: [
    {
      id: "ava",
      name: "Ava",
      pinHash: hashPin("1234"),
      investingEnabled: false,
      mode: "little",
      goalName: "Scooter day",
      goalAmountCents: 8000,
      allowanceCents: 1200,
      schedule: "weekly",
      scheduleAnchor: today,
      jarTargets: {
        spend: 60,
        save: 30,
        give: 10,
        grow: 0
      },
      theme: "default",
      createdAt: new Date().toISOString()
    },
    {
      id: "leo",
      name: "Leo",
      pinHash: hashPin("5678"),
      investingEnabled: true,
      mode: "big",
      goalName: "New gaming headset",
      goalAmountCents: 24000,
      allowanceCents: 1800,
      schedule: "weekly",
      scheduleAnchor: today,
      jarTargets: {
        spend: 40,
        save: 30,
        give: 10,
        grow: 20
      },
      theme: "default",
      createdAt: new Date().toISOString()
    }
  ],
  ledger: []
};
