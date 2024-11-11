export interface BadUSBProfile {
   vid: number;
   pid: number;
   mfrName?: string;
   prodName?: string;
}
export const usbProfiles: BadUSBProfile[] = [
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
];
