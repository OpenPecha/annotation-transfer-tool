import type { UiLanguage } from "@/app/shared/i18n/common";

export const selectorLabels = {
  en: {
    platformTitle: "Webuddhist Tools",
    platformSubtitle: "Choose a tool to get started",
    annotationTitle: "Annotation Transfer Tool",
    annotationDescription:
      "Transfer annotations from a labeled source document onto a plain target document.",
    pydurmaTitle: "Pydurma Collation",
    pydurmaDescription:
      "Upload multiple text witnesses, align variants, and export a collated result.",
    openTool: "Open tool",
  },
  bo: {
    platformTitle: "Webuddhist ལག་ཆ",
    platformSubtitle: "ལག་ཆ་གཅིག་འདེམས་ནས་འགོ་བཙུགས",
    annotationTitle: "མཆན་སྤོ་སྒྱུར་ལག་ཆ",
    annotationDescription:
      "མཆན་ཡོད་པའི་ཁུངས་ཡིག་ནས་མཆན་མེད་པའི་དམིགས་ཡུལ་ལ་མཆན་སྤོ་སྒྱུར་བྱེད།",
    pydurmaTitle: "Pydurma བསྡུར་བ",
    pydurmaDescription:
      "ཡིག་ཆ་མང་པོ་ཡར་འཇུག་བྱས་ནས་ཁྱད་པར་སྒྲིག་ནས་བསྡུར་འབྲས་ཕབ་ལེན་བྱེད།",
    openTool: "ལག་ཆ་ཁ་ཕྱེ",
  },
} as const satisfies Record<UiLanguage, Record<string, string>>;

export type SelectorLabels = (typeof selectorLabels)[UiLanguage];
