// src/styles/App.styles.js

export const containerStyle = (colors, isRTL, language) => ({
  minHeight: "100vh",
  backgroundColor: colors.background,
  direction: isRTL ? "rtl" : "ltr",
  overflowX: "hidden",
  fontFamily:
    language === "ar"
      ? "Arial, sans-serif"
      : "system-ui, -apple-system, sans-serif",
});

export const layoutStyle = (isMobile, isRTL) => ({
  display: "flex",
  minHeight: "100vh",
  flexDirection: isMobile ? "column" : isRTL ? "row-reverse" : "row",
  flexWrap: "nowrap",
});

export const leftPanelStyle = (colors, isMobile) => ({
  flex: 1,
  minWidth: 240,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  backgroundColor: colors.cardBg,
  borderRadius: isMobile ? "0" : "0px 5% 5% 0px",
});

export const headingStyle = (colors) => ({
  fontSize: 48,
  color: colors.text,
  margin: 0,
  fontWeight: 700,
  textAlign: "center",
  fontFamily: '"Reem Kufi Fun", "Pacifico", cursive',
  letterSpacing: "0.5px",
});

export const imageWrapperStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const rightPanelStyle = {
  flex: 1,
  minWidth: 320,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  maxHeight: "100vh",
  overflowY: "auto",
};
