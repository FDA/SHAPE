interface Options {
    max: string,
    min: string,
    pin: boolean,
    step: string,
    ticks: boolean,
}

interface Choice {
    index: string,
    order: number,
    text: string,
    value: string,
}

interface Rule {
    skipTo: string,
    ruleType: string,
    id: string,
    expression: RuleExpression,
}

interface RuleExpression {
    entries: RuleEntry[],
}

interface RuleEntry {
    value: string,
    fact: string,
    operator: string,
}

export interface Question {
    id?: string,
    title: string,
    variable: string,
    type: string,
    text?: string,
    required?: boolean,
    requiredMessage?: string,
    placeholder?:string,
    max?: string,
    min?: string,
    options?: Options,
    choices?: Choice[],
    format?: string,
    rules?: Rule[],
    org: string,
    sections?: any,
}
