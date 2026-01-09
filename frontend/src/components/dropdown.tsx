import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Controller, Control } from "react-hook-form";
import { Dropdown } from "react-native-element-dropdown";

interface Option {
  label: string;
  value: string | number;
}

interface AppDropdownProps<T extends string | number> {
  name: string;
  control: Control<any>;
  options: Option[];
  label?: string;
  error?: string;
  style?: any;
}

export const AppDropdown = <T extends string | number>({ name, control, options, label, error, style }: AppDropdownProps<T>) => {
  return (
    <View style={styles.container}>
      {error && (
        <Text style={{ color: "red", fontSize: 12 }}>{error}</Text>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <View>
            <Dropdown
              style={[
                styles.dropdown,
                style,
              ]}
              data={options}
              labelField="label"
              valueField="value"
              placeholder={label}
              value={value}
              onChange={(item) => onChange(item.value as T)}
              maxHeight={300}
              selectedTextStyle={styles.selectedText}
              placeholderStyle={styles.placeholder}
              itemTextStyle={styles.itemText}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "#707070",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  selectedText: {
    fontSize: 16,
    color: "#000",
  },
  placeholder: {
    fontSize: 16,
    color: "#707070",
  },
  itemText: {
    fontSize: 16,
    color: "#000",
  },
});
