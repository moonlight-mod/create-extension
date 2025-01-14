import { greeting } from "@moonlight-mod/wp/sampleExtension_someLibrary";

const logger = moonlight.getLogger("sampleExtension/entrypoint");
logger.info("Hello from entrypoint!");
logger.info("someLibrary exports:", greeting);

const natives = moonlight.getNatives("sampleExtension");
logger.info("node exports:", natives);
