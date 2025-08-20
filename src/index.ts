import {
  Agentica,
  IAgenticaHistoryJson,
  assertHttpLlmApplication,
} from "@agentica/core";
import {
  AgenticaRpcService,
  IAgenticaRpcListener,
  IAgenticaRpcService,
} from "@agentica/rpc";
import OpenAI from "openai";
import { WebSocketServer } from "tgrid";
import typia, { Primitive } from "typia";

import { SGlobal } from "./SGlobal";
import swagger from "./swagger.json";

const getPromptHistories = async (
  id: string,
): Promise<Primitive<IAgenticaHistoryJson>[]> => {
  // GET PROMPT HISTORIES FROM DATABASE
  id;
  return [];
};

const main = async (): Promise<void> => {
  if (SGlobal.env.OPENAI_API_KEY === undefined)
    console.error("env.OPENAI_API_KEY is not defined.");

  const server: WebSocketServer<
    null,
    IAgenticaRpcService<"chatgpt">,
    IAgenticaRpcListener
  > = new WebSocketServer();

  console.log(
    `Agentica 서버가 시작되었으며 ws://localhost:${SGlobal.env.PORT} 에서 연결을 기다리고 있습니다...`,
  );

  await server.open(Number(SGlobal.env.PORT), async (acceptor) => {
    // 👇 [수정됨] try...catch 블록으로 전체 로직을 감쌉니다.
    try {
      console.log(
        `✅ 클라이언트가 연결되었습니다. Agentica 서비스 준비를 시작합니다.`
      );
      
      const url: URL = new URL(`http://localhost${acceptor.path}`);
      const agent: Agentica<"chatgpt"> = new Agentica({
        config: {
          locale: "ko",
        },
        model: "chatgpt",
        vendor: {
          api: new OpenAI({ apiKey: SGlobal.env.OPENAI_API_KEY }),
          model: "gpt-4o-mini",
        },
        controllers: [
          {
            protocol: "http",
            name: "SoSangGongIn Service",
            application: assertHttpLlmApplication({
              model: "chatgpt",
              document: swagger,
            }),
            connection: {
              host: "http://localhost:3000",
            },
          },
        ],
        histories:
          url.pathname === "/"
            ? []
            : await getPromptHistories(url.pathname.slice(1)),
      });

      const service: AgenticaRpcService<"chatgpt"> = new AgenticaRpcService({
        agent,
        listener: acceptor.getDriver(),
      });

      await acceptor.accept(service);
      console.log("✅ Agentica 서비스 준비 완료. 클라이언트와 통신 가능 상태입니다.");

    } catch (err) {
      // 👇 [수정됨] 오류 발생 시 콘솔에 상세 내용을 출력합니다.
      console.error("❌ Agentica 서비스 준비 중 심각한 오류가 발생했습니다:", err);
      // 오류 발생 시 연결을 거부하거나 닫습니다.
      acceptor.close();
    }
  });
};

main().catch(console.error);