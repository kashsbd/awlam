import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center"
    },

    textInputContainer: {
        flex: 1,
        minWidth: 100,
        height: 34,
        margin: 4
    },

    textInput: {
        margin: 0,
        padding: 0,
        paddingLeft: 4,
        paddingRight: 12,
        flex: 1,
        height: 34,
        fontSize: 15,
        color: "rgba(0, 0, 0, 0.87)"
    },

    tag: {
        justifyContent: "center",
        backgroundColor: "#e0e0e0",
        borderRadius: 16,
        paddingLeft: 12,
        paddingRight: 12,
        height: 34,
        margin: 4
    },
    tagLabel: {
        fontSize: 15,
        // color: "rgba(0, 0, 0, 0.87)",
        color: 'black'
    }
});
