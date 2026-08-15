import type { ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type IconProps = {
  color: ColorValue;
  size?: number;
};

const ENVELOPE =
  'M3.5 4h9c.25 0 .485.06.692.169L8.75 7.5a1.25 1.25 0 0 1-1.5 0L2.808 4.169C3.015 4.06 3.251 4 3.5 4M2.001 5.438 2 5.5v5A1.5 1.5 0 0 0 3.5 12h9a1.5 1.5 0 0 0 1.5-1.5v-5l-.001-.062L9.65 8.7a2.75 2.75 0 0 1-3.3 0zM.5 5.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3z';

const HOUSE =
  'M12.5 12.618c.307-.275.5-.674.5-1.118V6.977a1.5 1.5 0 0 0-.585-1.189l-3.5-2.692a1.5 1.5 0 0 0-1.83 0l-3.5 2.692A1.5 1.5 0 0 0 3 6.978V11.5A1.496 1.496 0 0 0 4.493 13H5V9.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V13h.507c.381-.002.73-.146.993-.382m2-1.118a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3V6.977A3 3 0 0 1 2.67 4.6l3.5-2.692a3 3 0 0 1 3.66 0l3.5 2.692a3 3 0 0 1 1.17 2.378zm-5-2A.5.5 0 0 0 9 9H7a.5.5 0 0 0-.5.5V13h3z';

const SPARKLES =
  'M13 10a.75.75 0 0 1 .725.556 2.37 2.37 0 0 0 1.72 1.72.75.75 0 0 1 0 1.449 2.37 2.37 0 0 0-1.72 1.72.75.75 0 0 1-1.45 0 2.37 2.37 0 0 0-1.72-1.72.75.75 0 0 1 0-1.45 2.37 2.37 0 0 0 1.72-1.72l.043-.117A.75.75 0 0 1 13 10M7 0a1.5 1.5 0 0 1 1.48 1.253c.242 1.455.696 2.364 1.3 2.968.603.603 1.512 1.057 2.967 1.3a1.5 1.5 0 0 1 0 2.958c-1.455.243-2.364.697-2.968 1.3-.603.604-1.057 1.513-1.3 2.968a1.5 1.5 0 0 1-2.958 0c-.243-1.455-.697-2.364-1.3-2.968-.604-.603-1.513-1.057-2.968-1.3a1.5 1.5 0 0 1 0-2.958c1.455-.243 2.364-.697 2.968-1.3.603-.604 1.057-1.513 1.3-2.968l.028-.133A1.5 1.5 0 0 1 7 0m0 1.5C6.45 4.8 4.8 6.45 1.5 7c3.3.55 4.95 2.2 5.5 5.5.55-3.3 2.2-4.95 5.5-5.5C9.2 6.45 7.55 4.8 7 1.5';

const CHEVRON_LEFT =
  'M10.53 2.97a.75.75 0 0 1 0 1.06L6.56 8l3.97 3.97a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0';

const EYE =
  'M1.87 8.515 1.641 8l.229-.515a6.708 6.708 0 0 1 12.26 0l.228.515-.229.515a6.708 6.708 0 0 1-12.259 0M.5 6.876l-.26.585a1.33 1.33 0 0 0 0 1.079l.26.584a8.208 8.208 0 0 0 15 0l.26-.584a1.33 1.33 0 0 0 0-1.08l-.26-.584a8.208 8.208 0 0 0-15 0M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0';

const EYE_SLASH =
  'M3.03 1.97a.75.75 0 0 0-1.06 1.06l.83.83A8.2 8.2 0 0 0 .5 6.876l-.26.585a1.33 1.33 0 0 0 0 1.079l.26.585a8.21 8.21 0 0 0 11.434 3.87l1.036 1.035a.75.75 0 1 0 1.06-1.06zm7.788 9.908-1.294-1.293a3 3 0 0 1-4.109-4.109L3.866 4.927A6.7 6.7 0 0 0 1.87 7.486L1.641 8l.23.515a6.71 6.71 0 0 0 8.947 3.363M6.55 7.611A1.502 1.502 0 0 0 8.389 9.45zm1.658-2.604 2.784 2.784a3 3 0 0 0-2.784-2.784m5.92 3.508a6.7 6.7 0 0 1-.915 1.496l1.065 1.066A8.2 8.2 0 0 0 15.5 9.125l.26-.585a1.33 1.33 0 0 0 0-1.08l-.26-.584A8.21 8.21 0 0 0 5.572 2.37L6.81 3.61a6.71 6.71 0 0 1 7.32 3.877l.228.514z';

const CHECK =
  'M13.488 3.43a.75.75 0 0 1 .081 1.058l-6 7a.75.75 0 0 1-1.1.042l-3.5-3.5A.75.75 0 0 1 4.03 6.97l2.928 2.927 5.473-6.385a.75.75 0 0 1 1.057-.081';

const CHEVRON_RIGHT =
  'M5.47 13.03a.75.75 0 0 1 0-1.06L9.44 8 5.47 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0';

const PLUS =
  'M8 1.75a.75.75 0 0 1 .75.75v4.75h4.75a.75.75 0 0 1 0 1.5H8.75v4.75a.75.75 0 0 1-1.5 0V8.75H2.5a.75.75 0 0 1 0-1.5h4.75V2.5A.75.75 0 0 1 8 1.75';

const PERSON =
  'M8 8.5c3.85 0 7 2.5 7 4.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2c0-2 3.15-4.5 7-4.5M8 10c-1.61 0-3.064.526-4.092 1.234C2.798 12.001 2.5 12.733 2.5 13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5c0-.267-.297-1-1.408-1.766C11.064 10.526 9.609 10 8 10m0-9a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m0 1.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4';

const MINUS =
  'M1.75 8a.75.75 0 0 1 .75-.75h11a.75.75 0 0 1 0 1.5h-11A.75.75 0 0 1 1.75 8';

const GRADUATION_CAP =
  'M6.836 3.202 1.74 5.386a.396.396 0 0 0 0 .728l5.096 2.184a2.5 2.5 0 0 0 .985.202h.358a2.5 2.5 0 0 0 .985-.202l5.096-2.184a.396.396 0 0 0 0-.728L9.164 3.202A2.5 2.5 0 0 0 8.179 3h-.358a2.5 2.5 0 0 0-.985.202M1.5 7.642l1.5.644v3.228a2 2 0 0 0 1.106 1.789l.806.403a7 7 0 0 0 6.193.033l.909-.442a2 2 0 0 0 1.125-1.798V8.226l1.712-.734a1.896 1.896 0 0 0 0-3.484L9.755 1.823A4 4 0 0 0 8.179 1.5h-.358a4 4 0 0 0-1.576.323L1.15 4.008A1.9 1.9 0 0 0 0 5.75v4.5a.75.75 0 0 0 1.5 0zm3 3.872V8.929l1.745.748A4 4 0 0 0 7.821 10h.358a4 4 0 0 0 1.576-.323l1.884-.808v2.63a.5.5 0 0 1-.282.45l-.909.442a5.5 5.5 0 0 1-4.865-.027l-.807-.403a.5.5 0 0 1-.276-.447';

const TRASH_BIN =
  'M9 2H7a.5.5 0 0 0-.5.5V3h3v-.5A.5.5 0 0 0 9 2m2 1v-.5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2V3H2.251a.75.75 0 0 0 0 1.5h.312l.317 7.625A3 3 0 0 0 5.878 15h4.245a3 3 0 0 0 2.997-2.875l.318-7.625h.312a.75.75 0 0 0 0-1.5zm.936 1.5H4.064l.315 7.562A1.5 1.5 0 0 0 5.878 13.5h4.245a1.5 1.5 0 0 0 1.498-1.438zm-6.186 2v5a.75.75 0 0 0 1.5 0v-5a.75.75 0 0 0-1.5 0m3.75-.75a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75';

const ELLIPSIS =
  'M3 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0';

const PICTURE =
  'M11.5 3h-7A1.5 1.5 0 0 0 3 4.5v5.027l.962-.7a1.75 1.75 0 0 1 2.079.016l.928.696 2.368-2.03a1.75 1.75 0 0 1 2.325.043L13 8.787V4.5A1.5 1.5 0 0 0 11.5 3m3 7.498V4.5a3 3 0 0 0-3-3h-7a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3zm-1.5.33-2.355-2.174a.25.25 0 0 0-.332-.006L7.488 11.07l-.457.392-.481-.361-1.41-1.057a.25.25 0 0 0-.296-.002L3 11.381v.119A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5zM7.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0';

const CAMERA =
  'M4.273 5h1.05l.36-.987.248-.684A.5.5 0 0 1 6.401 3h3.198a.5.5 0 0 1 .47.33l.249.683.359.987H12a1.5 1.5 0 0 1 1.5 1.5V11a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 11V6.5A1.5 1.5 0 0 1 4 5zM6.4 1.5a2 2 0 0 0-1.88 1.317l-.248.683H4a3 3 0 0 0-3 3V11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6.5a3 3 0 0 0-3-3h-.273l-.248-.683A2 2 0 0 0 9.599 1.5zm3.099 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m1.5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0';

const MICROPHONE =
  'M9.5 7V3.5a1.5 1.5 0 1 0-3 0V7a1.5 1.5 0 1 0 3 0M8 .5a3 3 0 0 0-3 3V7a3 3 0 0 0 6 0V3.5a3 3 0 0 0-3-3m.75 12.454A6 6 0 0 0 14 7v-.25a.75.75 0 0 0-1.5 0V7a4.5 4.5 0 1 1-9 0v-.25a.75.75 0 0 0-1.5 0V7c0 3.06 2.29 5.585 5.25 5.954v1.796a.75.75 0 0 0 1.5 0z';

const FOLDERS =
  'm8.879 4-.44-.44-.767-.767a1 1 0 0 0-.708-.293H6A1.5 1.5 0 0 0 4.5 4v5A1.5 1.5 0 0 0 6 10.5h7A1.5 1.5 0 0 0 14.5 9V5.5A1.5 1.5 0 0 0 13 4zM6 1a3 3 0 0 0-3 3 3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3 3 3 0 0 0 3-3V5.5a3 3 0 0 0-3-3H9.5l-.768-.768A2.5 2.5 0 0 0 6.964 1zM1.5 7A1.5 1.5 0 0 1 3 5.5V9a3 3 0 0 0 3 3h5.5a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 12zm10.75 0a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5z';

const MAGNIFIER =
  'M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0m-.82 4.74a6 6 0 1 1 1.06-1.06l2.79 2.79a.75.75 0 1 1-1.06 1.06z';

const SORT =
  'M2.22 13.28a.75.75 0 0 0 1.06 0l2-2a.75.75 0 1 0-1.06-1.06l-.72.72V3.25a.75.75 0 0 0-1.5 0v7.69l-.72-.72a.75.75 0 1 0-1.06 1.06zM7 3.25a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7 3.25m.75 4a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm0 4.75a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z';

const XMARK =
  'M3.47 3.47a.75.75 0 0 1 1.06 0L8 6.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L9.06 8l3.47 3.47a.75.75 0 1 1-1.06 1.06L8 9.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L6.94 8 3.47 4.53a.75.75 0 0 1 0-1.06';

const GRIP =
  'M7 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M5.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m0-5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M7 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m3.5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3';

const MEDAL =
  'M11.836 1.5a.664.664 0 0 1 .491 1.11l-.354.39H4.027l-.354-.39a.664.664 0 0 1 .49-1.11zm-6.445 3 2.124 2.336a.5.5 0 0 0 .37.164h.23a.5.5 0 0 0 .37-.164L10.61 4.5zm.652 2.947L3.5 4.65v1.852a.5.5 0 0 0 .123.328L4.87 8.266a4.5 4.5 0 0 1 1.172-.82m-2.08 2.061-1.47-1.693A2 2 0 0 1 2 6.502V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4.502a2 2 0 0 1-.49 1.312l-1.474 1.694a4.5 4.5 0 1 1-8.073 0m7.166-1.242a4.5 4.5 0 0 0-1.172-.82L12.5 4.65v1.852a.5.5 0 0 1-.123.328zM11 11.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0';

const GEAR =
  'M7.199 2H8.8a.2.2 0 0 1 .2.2c0 1.808 1.958 2.939 3.524 2.034a.2.2 0 0 1 .271.073l.802 1.388a.2.2 0 0 1-.073.272c-1.566.904-1.566 3.164 0 4.069a.2.2 0 0 1 .073.271l-.802 1.388a.2.2 0 0 1-.271.073C10.958 10.863 9 11.993 9 13.8a.2.2 0 0 1-.199.2H7.2a.2.2 0 0 1-.2-.2c0-1.808-1.958-2.938-3.524-2.034a.2.2 0 0 1-.272-.073l-.8-1.388a.2.2 0 0 1 .072-.271c1.566-.905 1.566-3.165 0-4.07a.2.2 0 0 1-.073-.27l.801-1.389a.2.2 0 0 1 .272-.072C5.042 5.138 7 4.007 7 2.199c0-.11.089-.199.199-.199M5.5 2.2c0-.94.76-1.7 1.699-1.7H8.8c.94 0 1.7.76 1.7 1.7a.85.85 0 0 0 1.274.735 1.7 1.7 0 0 1 2.32.622l.802 1.388c.469.813.19 1.851-.622 2.32a.85.85 0 0 0 0 1.472 1.7 1.7 0 0 1 .622 2.32l-.802 1.388a1.7 1.7 0 0 1-2.32.622.85.85 0 0 0-1.274.735c0 .939-.76 1.7-1.699 1.7H7.2a1.7 1.7 0 0 1-1.699-1.7.85.85 0 0 0-1.274-.735 1.7 1.7 0 0 1-2.32-.622l-.802-1.388a1.7 1.7 0 0 1 .622-2.32.85.85 0 0 0 0-1.471 1.7 1.7 0 0 1-.622-2.32l.801-1.389a1.7 1.7 0 0 1 2.32-.622A.85.85 0 0 0 5.5 2.2m4 5.8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0';

const HEADING =
  'M4.25 2.25A.75.75 0 0 1 5 3v4.25h6V3a.75.75 0 0 1 1.5 0v10a.75.75 0 0 1-1.5 0V8.75H5V13a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75';

const BOLD =
  'M4.25 2.25A.75.75 0 0 0 3.5 3v10c0 .414.336.75.75.75H9.5a3.25 3.25 0 0 0 1.477-6.146A3.25 3.25 0 0 0 8.5 2.25zm3.5 5a1.75 1.75 0 1 0 0-3.5h-2v3.5zm-2 1.5v3.5h3a1.75 1.75 0 1 0 0-3.5z';

const ITALIC =
  'M7.25 2a.75.75 0 0 0 0 1.5h1.317l-2.7 9H4.25a.75.75 0 1 0 0 1.5h4.5a.75.75 0 0 0 0-1.5H7.433l2.7-9h1.617a.75.75 0 0 0 0-1.5z';

const LIST_UL =
  'M2.5 5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m3.25-2a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5zm0 8.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5zM5 8a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 8M3.75 8a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0M2.5 13.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5';

const LIST_CHECK =
  'M5.28 2.22a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 0 1-1.06 0l-1-1a.75.75 0 0 1 1.06-1.06l.47.47 1.47-1.47a.75.75 0 0 1 1.06 0M6.5 3.75c0 .414.336.75.75.75h7a.75.75 0 0 0 0-1.5h-7a.75.75 0 0 0-.75.75m.75 3.5a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5zm-1.97.03a.75.75 0 0 0-1.06-1.06L2.75 7.69l-.47-.47a.75.75 0 0 0-1.06 1.06l1 1a.75.75 0 0 0 1.06 0zm0 3.19a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 0 1-1.06 0l-1-1a.75.75 0 1 1 1.06-1.06l.47.47 1.47-1.47a.75.75 0 0 1 1.06 0m1.97 1.03a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5z';

const ROTATE =
  'M8 1.5a6.5 6.5 0 1 0 6.445 7.348.75.75 0 1 0-1.487-.194A5.001 5.001 0 1 1 11.57 4.5h-1.32a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 0-1.5 0v1.06A6.48 6.48 0 0 0 8 1.5';

const FILE_TEXT =
  'M5 13.5h6a1.5 1.5 0 0 0 1.5-1.5V7.243a1.5 1.5 0 0 0-.44-1.061L8.819 2.939a1.5 1.5 0 0 0-1.06-.439H5A1.5 1.5 0 0 0 3.5 4v8A1.5 1.5 0 0 0 5 13.5m9-6.257a3 3 0 0 0-.879-2.122L9.88 1.88A3 3 0 0 0 7.757 1H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3zM5 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 8.25m.75 2.25a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5z';

const COPY =
  'M12 2.5H8A1.5 1.5 0 0 0 6.5 4v1H8a3 3 0 0 1 3 3v1.5h1A1.5 1.5 0 0 0 13.5 8V4A1.5 1.5 0 0 0 12 2.5M11 11h1a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1H4a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3zM4 6.5h4A1.5 1.5 0 0 1 9.5 8v4A1.5 1.5 0 0 1 8 13.5H4A1.5 1.5 0 0 1 2.5 12V8A1.5 1.5 0 0 1 4 6.5';

const CLOCK =
  'M13.5 8a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M8.75 4.5a.75.75 0 0 0-1.5 0V8a.75.75 0 0 0 .3.6l2 1.5a.75.75 0 1 0 .9-1.2l-1.7-1.275z';

const CALENDAR =
  'M5.25 5.497a.75.75 0 0 1-.75-.75V4A1.5 1.5 0 0 0 3 5.5v1h10v-1A1.5 1.5 0 0 0 11.5 4v.75a.75.75 0 0 1-1.5 0V4H6v.747a.75.75 0 0 1-.75.75M10 2.5H6v-.752a.75.75 0 1 0-1.5 0V2.5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3v-.75a.75.75 0 0 0-1.5 0zM3 8v3.5A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5V8z';

const UNDERLINE =
  'M5 2.75a.75.75 0 0 0-1.5 0V7a4.5 4.5 0 0 0 9 0V2.75a.75.75 0 0 0-1.5 0V7a3 3 0 0 1-6 0zm-.75 9.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5z';

const SMILE =
  'M13.5 8a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M6.67 9.665a.75.75 0 0 0-1.34.67c.403.809 1.452 1.415 2.67 1.415s2.267-.606 2.67-1.415a.75.75 0 1 0-1.34-.67c-.097.191-.548.585-1.33.585s-1.233-.394-1.33-.585M10 8a.75.75 0 0 1-.75-.75v-1a.75.75 0 0 1 1.5 0v1A.75.75 0 0 1 10 8m-4.75-.75a.75.75 0 0 0 1.5 0v-1a.75.75 0 0 0-1.5 0z';

const SLIDERS =
  'M1.25 3.25A.75.75 0 0 1 2 2.5h12A.75.75 0 0 1 14 4H2a.75.75 0 0 1-.75-.75m0 4.75A.75.75 0 0 1 2 7.25h12a.75.75 0 0 1 0 1.5H2A.75.75 0 0 1 1.25 8M2 12a.75.75 0 0 0 0 1.5h12a.75.75 0 0 0 0-1.5z';

const PENCIL =
  'M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04 2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z';

const CHEVRON_DOWN =
  'M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06';

const TEXT_LINES =
  'M2.75 2a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5zm0 7a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5zm0 3.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5zM2 6.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 2 6.25';

const PENCIL_TO_LINE =
  'M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04 2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z';

const UTURN_LEFT =
  'M2.47 4.72a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06L4.81 6H9a3.25 3.25 0 0 1 0 6.5H8A.75.75 0 0 0 8 14h1a4.75 4.75 0 1 0 0-9.5H4.81l1.72-1.72a.75.75 0 0 0-1.06-1.06z';

const ERASER =
  'm9.646 3.268 2.586 2.586a.914.914 0 0 1 0 1.292L8.72 10.66 4.84 6.78l3.513-3.512a.914.914 0 0 1 1.292 0M3.78 7.84 1.768 9.854a.914.914 0 0 0 0 1.292L3.12 12.5h3.76l.78-.78zm9.513.366L9 12.5h6.25a.75.75 0 0 1 0 1.5H2.5L.707 12.207a2.414 2.414 0 0 1 0-3.414l6.586-6.586a2.414 2.414 0 0 1 3.414 0l2.586 2.586a2.414 2.414 0 0 1 0 3.414';

function GravityIcon({ d, color, size }: IconProps & { d: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d={d} fill={color} fillRule="evenodd" clipRule="evenodd" />
    </Svg>
  );
}

export function InicioIcon({ color, size = 21 }: IconProps) {
  return <GravityIcon d={HOUSE} color={color} size={size} />;
}

export function SparklesIcon({ color, size = 20 }: IconProps) {
  return <GravityIcon d={SPARKLES} color={color} size={size} />;
}

export function MailIcon({ color, size = 18 }: IconProps) {
  return <GravityIcon d={ENVELOPE} color={color} size={size} />;
}

export function ChevronLeftIcon({ color, size = 20 }: IconProps) {
  return <GravityIcon d={CHEVRON_LEFT} color={color} size={size} />;
}

export function EyeIcon({ color, size = 18 }: IconProps) {
  return <GravityIcon d={EYE} color={color} size={size} />;
}

export function EyeSlashIcon({ color, size = 18 }: IconProps) {
  return <GravityIcon d={EYE_SLASH} color={color} size={size} />;
}

export function CheckIcon({ color, size = 12 }: IconProps) {
  return <GravityIcon d={CHECK} color={color} size={size} />;
}

export function ChevronRightIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={CHEVRON_RIGHT} color={color} size={size} />;
}

export function PlusIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={PLUS} color={color} size={size} />;
}

export function PersonIcon({ color, size = 21 }: IconProps) {
  return <GravityIcon d={PERSON} color={color} size={size} />;
}

export function MinusIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={MINUS} color={color} size={size} />;
}

export function SemesterIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={GRADUATION_CAP} color={color} size={size} />;
}

export function TrashIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={TRASH_BIN} color={color} size={size} />;
}

export function EllipsisIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={ELLIPSIS} color={color} size={size} />;
}

export function PictureIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={PICTURE} color={color} size={size} />;
}

export function NoteGlyph({ color, size = 16 }: IconProps) {
  return <GravityIcon d={TEXT_LINES} color={color} size={size} />;
}

export function FirmaIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={PENCIL_TO_LINE} color={color} size={size} />;
}

export function UndoIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={UTURN_LEFT} color={color} size={size} />;
}

export function EraserIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={ERASER} color={color} size={size} />;
}

export function CameraIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={CAMERA} color={color} size={size} />;
}

export function MicIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={MICROPHONE} color={color} size={size} />;
}

export function FolderIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={FOLDERS} color={color} size={size} />;
}

export function SearchIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={MAGNIFIER} color={color} size={size} />;
}

export function SortIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={SORT} color={color} size={size} />;
}

export function CloseIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={XMARK} color={color} size={size} />;
}

export function GripIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={GRIP} color={color} size={size} />;
}

export function GradeIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={MEDAL} color={color} size={size} />;
}

export function GearIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={GEAR} color={color} size={size} />;
}

export function HeadingIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={HEADING} color={color} size={size} />;
}

export function BoldIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={BOLD} color={color} size={size} />;
}

export function ItalicIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={ITALIC} color={color} size={size} />;
}

export function ListIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={LIST_UL} color={color} size={size} />;
}

export function ChecklistIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={LIST_CHECK} color={color} size={size} />;
}

export function RotateIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={ROTATE} color={color} size={size} />;
}

export function ChevronDownIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={CHEVRON_DOWN} color={color} size={size} />;
}

export function PencilIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={PENCIL} color={color} size={size} />;
}

export function NoteIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={FILE_TEXT} color={color} size={size} />;
}

export function CopyIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={COPY} color={color} size={size} />;
}

export function ClockIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={CLOCK} color={color} size={size} />;
}

export function CalendarIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={CALENDAR} color={color} size={size} />;
}

export function UnderlineIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={UNDERLINE} color={color} size={size} />;
}

export function FiltersIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={SLIDERS} color={color} size={size} />;
}

export function SmileIcon({ color, size = 16 }: IconProps) {
  return <GravityIcon d={SMILE} color={color} size={size} />;
}

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <Path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <Path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <Path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </Svg>
  );
}

export function DiscordIcon({
  size = 18,
  color = '#5865F2',
}: {
  size?: number;
  color?: ColorValue;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M19.27 5.33A16.5 16.5 0 0 0 15.2 4.1a.06.06 0 0 0-.07.03c-.17.31-.37.72-.51 1.04a15.3 15.3 0 0 0-4.24 0 9.6 9.6 0 0 0-.52-1.04.06.06 0 0 0-.07-.03c-1.4.24-2.76.66-4.06 1.23a.06.06 0 0 0-.03.02C2.98 9.2 2.25 12.95 2.61 16.66c0 .02.02.04.04.05a16.6 16.6 0 0 0 4.99 2.5.07.07 0 0 0 .07-.02c.38-.52.72-1.07 1.02-1.65a.06.06 0 0 0-.04-.09c-.54-.2-1.06-.45-1.55-.73a.06.06 0 0 1 0-.11l.31-.24a.06.06 0 0 1 .06 0 11.9 11.9 0 0 0 10.02 0 .06.06 0 0 1 .07 0l.3.24a.06.06 0 0 1 0 .11c-.5.29-1.01.53-1.55.73a.06.06 0 0 0-.04.09c.3.58.65 1.13 1.02 1.65a.06.06 0 0 0 .07.02 16.5 16.5 0 0 0 5-2.5.06.06 0 0 0 .03-.04c.43-4.29-.72-8.01-3.05-11.32a.05.05 0 0 0-.03-.02zM8.68 14.4c-1 0-1.82-.9-1.82-2.02s.8-2.03 1.82-2.03c1.03 0 1.85.92 1.83 2.03 0 1.11-.8 2.02-1.83 2.02m6.65 0c-1 0-1.82-.9-1.82-2.02s.8-2.03 1.82-2.03c1.03 0 1.85.92 1.83 2.03 0 1.11-.8 2.02-1.83 2.02"
      />
    </Svg>
  );
}
