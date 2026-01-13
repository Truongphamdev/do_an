import React from "react";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";

import PendingPaymentList from "../screens/staff/cashier/pendingPaymentList";
import WaitingForPayment from "../screens/staff/cashier/waitingForPayment";
import InvoiceDetail from "../screens/staff/cashier/invoiceDetail";
import Payment from "../screens/staff/cashier/payment";
import PaymentHistory from "../screens/staff/cashier/paymentHistory";

export type CashierStackParamList = {
    PendingPaymentList: undefined;
    WaitingForPayment: undefined;
    InvoiceDetail: undefined;
    Payment: undefined;
    PaymentHistory: undefined;
}

export type CashierNav = NativeStackNavigationProp<CashierStackParamList>;

const Stack = createNativeStackNavigator<CashierStackParamList>();

const CashierNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="PendingPaymentList" screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="PendingPaymentList" component={PendingPaymentList} options={{ headerShown: false }}/>
            <Stack.Screen name="WaitingForPayment" component={WaitingForPayment} options={{ headerShown: false }}/>
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetail} options={{ headerShown: false }}/>
            <Stack.Screen name="Payment" component={Payment} options={{ headerShown: false }}/>
            <Stack.Screen name="PaymentHistory" component={PaymentHistory} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}

export default CashierNavigator;