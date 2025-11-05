import React from "react";
import { View, StyleSheet } from "react-native";
import { Controller, Control } from "react-hook-form";
import { Dropdown } from "react-native-element-dropdown";
import { globalStyles } from "../styles/style";

interface Option {
  label: string;
  value: string;
}

interface AppDropdownProps {
  name: string;
  control: Control<any>;
  options: Option[];
  label: string;
}

export const AppDropdown = ({ name, control, options, label }: AppDropdownProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <View style={globalStyles.app_dropdown}>
          <Dropdown
            style={styles.dropdown}
            data={options}
            labelField="label"
            valueField="value"
            placeholder={label}
            value={value}
            onChange={(item) => onChange(item.value)} // ✅ truyền giá trị thật cho react-hook-form
            maxHeight={300}
            selectedTextStyle={styles.selectedTextStyle}
            placeholderStyle={styles.placeholderStyle}
            itemTextStyle={styles.itemTextStyle}
            containerStyle={styles.containerStyle}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#000",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#888",
  },
  itemTextStyle: {
    fontSize: 16,
    color: "#000",
  },
  containerStyle: {
    borderRadius: 8,
  },
});
