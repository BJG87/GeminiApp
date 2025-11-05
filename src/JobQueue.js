function setKeys(keys, i) {

  props.setProperty("GEMINI_API_KEYS", JSON.stringify(keys));
  console.log(
    `API key at index ${i} succeeded; rotated it to the front for future runs.`
  );
}

function getKeys() {
  const props = PropertiesService.getScriptProperties();
  const keysProp = props.getProperty("GEMINI_API_KEYS") || "[]";
  let keys;
  try {
    keys = JSON.parse(keysProp);
  } catch (_e) {
    keys = [];
  }
  if (!Array.isArray(keys) || keys.length === 0) {
    throw new Error(
      "No GEMINI_API_KEYS configured. Set a JSON array of API keys in script properties."
    );
  }
  return keys;
}

function startProcessingJobs() {
  const triggers = ScriptApp.getProjectTriggers();
  const existingTrigger = triggers.find(
    (t) => t.getHandlerFunction() === "processJobs"
  );
  if (!existingTrigger) {
    ScriptApp.newTrigger("processJobs")
      .timeBased()
      .everyMinutes(1)
      .create();
  }
}

function stopProcessJobs() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => {
    if (t.getHandlerFunction() === "processJobs") {
      ScriptApp.deleteTrigger(t);
    }
  });
}
