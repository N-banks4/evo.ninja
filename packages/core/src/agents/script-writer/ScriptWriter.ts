import { loop } from "./loop";
import { agentFunctions } from "./agent-functions";
import { RunResult, StepOutput, Agent } from "../agent";
import { executeAgentFunction } from "../agent-function";
import { WrapClient } from "../../wrap";
import { Scripts } from "../../Scripts";
import { LlmApi, Chat } from "../../llm";
import { Workspace } from "../../sys";

export class ScriptWriter implements Agent {
  private client: WrapClient;
  private globals: Record<string, any> = {};

  constructor(
    public readonly workspace: Workspace,
    private readonly scripts: Scripts,
    private readonly llm: LlmApi,
    private readonly chat: Chat
  ) {
    this.client = new WrapClient(
      this.workspace,
    );
    
    this.globals = {};
  }

  public async* run(
    namespace: string, 
    description: string,
    args: string,
    developerNote?: string
  ): AsyncGenerator<StepOutput, RunResult, string | undefined> {
    try {
      return yield* loop(
        namespace, 
        description, 
        args, 
        developerNote,
        this.llm, 
        this.chat, 
        this.client, 
        this.globals,
        this.workspace,
        this.scripts,
        executeAgentFunction,
        agentFunctions
      );
    } catch (err) {
      console.error(err);
      return RunResult.error( "Unrecoverable error encountered.");
    }
  }
}