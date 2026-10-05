; Custom NSIS Installer Extension for Recording Software
; Handles Desktop Shortcut checkbox and Run Application checkbox on Finish Page

!macro customFinishPage
  Function StartApp
    ${if} ${isUpdated}
      StrCpy $1 "--updated"
    ${else}
      StrCpy $1 ""
    ${endif}
    ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" "$1"
  FunctionEnd

  Function CreateDesktopShortcutFinish
    CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0
  FunctionEnd

  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_FUNCTION "StartApp"
  !define MUI_FINISHPAGE_RUN_TEXT "Run ${PRODUCT_NAME} now"

  !define MUI_FINISHPAGE_SHOWREADME ""
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Create Desktop Shortcut"
  !define MUI_FINISHPAGE_SHOWREADME_FUNCTION "CreateDesktopShortcutFinish"

  !insertmacro MUI_PAGE_FINISH
!macroend
