import React from "react";
import {Avatar, Button, Spacer, Tab, Tabs, Tooltip, useDisclosure} from "@nextui-org/react";

export default function Settings() {
  return (
    <div className="w-full max-w-2xl flex-1 p-4">
        {/* Title */}
        <div className="flex items-center gap-x-3">
          <Button isIconOnly className="sm:hidden" size="sm" variant="flat" onPress={onOpenChange}>
            <Icon
              className="text-default-500"
              icon="solar:sidebar-minimalistic-linear"
              width={20}
            />
          </Button>
          <h1 className="text-3xl font-bold leading-9 text-default-foreground">Settings</h1>
        </div>
        <h2 className="mt-2 text-small text-default-500">
          Customize settings, email preferences, and web appearance.
        </h2>
        {/*  Tabs */}
        <Tabs
          fullWidth
          classNames={{
            base: "mt-6",
            cursor: "bg-content1 dark:bg-content1",
            panel: "w-full p-0 pt-4",
          }}
        >
          <Tab key="profile" title="Profile">
            <ProfileSetting />
          </Tab>
          <Tab key="appearance" title="Appearance">
            <AppearanceSetting />
          </Tab>
          <Tab key="account" title="Account">
            <AccountSetting />
          </Tab>
          <Tab key="billing" title="Billing">
            <BillingSetting />
          </Tab>
          <Tab key="team" title="Team">
            <TeamSetting />
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}