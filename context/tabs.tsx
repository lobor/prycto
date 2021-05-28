import React from "react";

export interface Tab {
  key: string;
  label: string;
  canClose: boolean;
  exchange?: string;
}

interface ContextTabs {
  tabs: Tab[];
  selected: string;
  addTab: (tab: Tab) => void;
  removeTab: (tabName: string) => void;
  selectTab: (keyTab: string) => void;
}

const TabsContext = React.createContext<ContextTabs>({
  tabs: [],
  selected: "",
  addTab: () => {},
  removeTab: () => {},
  selectTab: () => {},
});

const TabsProvider: React.FC<{ value: { tabs: Tab[]; selected: string } }> = ({
  children,
  value,
}) => {
  const [tabs, setTabs] = React.useState(value.tabs);
  const [selected, setSelected] = React.useState(value.selected);

  const addTab = (tab: Tab) => {
    console.log(tab)
    if (tabs.filter(({ key }) => key === tab.key).length) {
      setSelected(tab.key)
    } else {
      setTabs([...tabs, tab]);
    }
  };

  const removeTab = (tabName: string) => {
    const isLastTabs = tabs[tabs.length - 1].key === tabName;
    if (isLastTabs && selected === tabName) {
      setSelected(tabs[tabs.length - 2].key);
    }
    setTabs(tabs.filter(({ key, canClose }) => !(canClose && key == tabName)));
  };

  const selectTab = (keyTab: string) => {
    setSelected(keyTab);
  };

  return (
    <TabsContext.Provider
      value={{ tabs, addTab, removeTab, selectTab, selected }}
    >
      {children}
    </TabsContext.Provider>
  );
};

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (context === undefined) {
    throw new Error("useTabsContext must be used within a TabsProvider");
  }

  return context;
}

export { TabsProvider, useTabsContext };
