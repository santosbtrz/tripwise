# Preserve Ionic and Capacitor classes
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Preserve WebView-based interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
