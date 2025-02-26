import { getDevCycleProvider, getOpenFeatureClient } from "../devcycle";

/**
 * Since this is used outside a request context, we define a service user.
 * This can contain properties unique to this service, and allows you to target
 * services in the same way you would target app users.
 */
const SERVICE_USER = { user_id: "api-service" };

/**
 * Log togglebot to the console overwriting the previous frame
 */
export const logVariation = () => {
  const devcycleProvider = getDevCycleProvider();
  const openFeatureClient = getOpenFeatureClient();

  openFeatureClient.track("of-test-event", SERVICE_USER, {
    value: 610,
    metaDataString: "test-metadata",
    metaDataFloat: 1.23,
    metaDataBoolean: true,
    metaDataObject: {
      test: "test",
    },
  });

  let idx = 0;
  const renderFrame = async () => {
    // fetch the Variation name from DevCycle
    const features = await devcycleProvider.devcycleClient.allFeatures(
      SERVICE_USER
    );
    const { variationName = "Default" } = features["hello-togglebot"] ?? {};

    // fetch the togglebot variables from OpenFeature
    const wink = await openFeatureClient.getBooleanValue(
      "togglebot-wink",
      false,
      SERVICE_USER
    );
    const speed = await openFeatureClient.getStringValue(
      "togglebot-speed",
      "off",
      SERVICE_USER
    );

    const spinChars = speed === "slow" ? "◟◜◝◞" : "◜◠◝◞◡◟";
    const spinner = speed === "off" ? "○" : spinChars[idx % spinChars.length];
    idx = (idx + 1) % spinChars.length;

    const face = wink ? "(○ ‿ ○)" : "(- ‿ ○)";

    const frame = `${spinner} Serving variation: ${variationName} ${face}`;
    const color = speed === "surprise" ? "rainbow" : "blue";

    writeToConsole(frame, color);

    const timeout = ["fast", "surprise", "off-axis"].includes(speed)
      ? 100
      : 500;
    setTimeout(renderFrame, timeout);
  };

  setTimeout(async () => {
    process.stdout.write("\n");
    await renderFrame();
  }, 500);
};

const COLORS = {
  red: "\x1b[91m",
  green: "\x1b[92m",
  yellow: "\x1b[93m",
  blue: "\x1b[94m",
  magenta: "\x1b[95m",
};
const END_CHAR = "\x1b[0m";
type Color = keyof typeof COLORS | "rainbow";

/**
 * Use chalk to apply the given color to the text
 */
const addColor = (text: string, color: Color) => {
  const colors = {
    ...COLORS,
    rainbow: Object.values(COLORS)[Date.now() % 5],
  };

  return colors.hasOwnProperty(color) ? colors[color] + text + END_CHAR : text;
};

/**
 * Write the text to stdout, with the given colour
 */
const writeToConsole = (text: string, color: Color) => {
  text = addColor(text, color);

  process.stdout.write("\x1b[K  " + text + "\r");
};
