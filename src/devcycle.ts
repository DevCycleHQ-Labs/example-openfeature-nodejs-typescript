import { DevCycleProvider } from "@devcycle/nodejs-server-sdk";
import { OpenFeature, Client } from "@openfeature/server-sdk";

const DEVCYCLE_SERVER_SDK_KEY = process.env.DEVCYCLE_SERVER_SDK_KEY as string;

let devcycleProvider: DevCycleProvider;
let openFeatureClient: Client;

export const getDevCycleProvider = () => devcycleProvider;
export const getOpenFeatureClient = () => openFeatureClient;

export async function initializeDevCycleWithOpenFeature() {
  devcycleProvider = new DevCycleProvider(DEVCYCLE_SERVER_SDK_KEY, {
    logLevel: "debug",
    // Controls the polling interval in milliseconds to fetch new environment config changes
    configPollingIntervalMS: 5 * 1000,
    // Controls the interval between flushing events to the DevCycle servers
    eventFlushIntervalMS: 1000,
    enableCloudBucketing: true,
  });

  // Pass the DevCycle OpenFeature Provider to OpenFeature, wait for devcycle to be initialized
  await OpenFeature.setProviderAndWait(devcycleProvider);
  openFeatureClient = OpenFeature.getClient();

  return { devcycleProvider, openFeatureClient };
}
