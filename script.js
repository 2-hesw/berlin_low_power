(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeStorageKey = "hesw-blog-theme-v6";
  const storedTheme = localStorage.getItem(themeStorageKey);
  root.dataset.theme = storedTheme === "dark" ? "dark" : "light";

  function updateThemeLabel() {
    if (!themeToggle) return;
    const isDark = root.dataset.theme === "dark";
    themeToggle.setAttribute("aria-label", isDark ? "切换浅色模式" : "切换深色模式");
    themeToggle.setAttribute("title", isDark ? "切换浅色模式" : "切换深色模式");
  }

  updateThemeLabel();

  themeToggle?.addEventListener("click", function () {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem(themeStorageKey, nextTheme);
    updateThemeLabel();
  });

  const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
  const postCards = Array.from(document.querySelectorAll(".post-card"));

  function applyFilter(filter) {
    filterButtons.forEach(function (button) {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    postCards.forEach(function (card) {
      const visible = filter === "all" || card.dataset.topic === filter;
      card.classList.toggle("is-hidden", !visible);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.dataset.filter || "all");
    });
  });

  document.querySelectorAll("[data-filter-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      applyFilter(link.dataset.filterLink || "all");
    });
  });

  if (filterButtons.length) {
    applyFilter("all");
  }

  const articleData = {
    "pd-separation": {
      topic: "AI Infra",
      topicClass: "topic-tech",
      date: "2026.08.09",
      datetime: "2026-08-09",
      readingTime: "8 分钟",
      title: "Prefill / Decode 分离，我目前理解到了哪一步",
      deck: "这不是一篇教程，而是一份阶段性的理解快照。",
      toc: [
        ["question", "问题从哪里开始"],
        ["model", "我现在的理解模型"],
        ["unknown", "仍未解决的问题"]
      ],
      bodyHtml: `
        <p class="lead-paragraph">第一次接触 Prefill / Decode 分离时，我把它理解成一种简单的资源拆分：两种阶段计算特征不同，所以分别部署。后来才发现，真正困难的并不是“拆开”，而是拆开之后如何继续把请求、KV Cache、调度和故障边界连成一个系统。</p>
        <h2 id="question">问题从哪里开始</h2>
        <p>Prefill 更接近计算密集型任务，Decode 则更容易受到显存带宽与逐 Token 调度影响。如果让它们共享相同资源池，两种负载会互相干扰；但如果完全拆开，KV Cache 的传输和跨节点协调又会成为新的成本。</p>
        <blockquote>拆分不是答案，拆分后新增的边界才是系统设计真正开始的地方。</blockquote>
        <h2 id="model">我现在的理解模型</h2>
        <p>目前我会从四层观察一套分离式推理系统：请求入口如何判断路由，Prefill 如何选择实例，KV 如何交给 Decode，以及资源层如何分别扩缩。</p>
        <div class="concept-flow" aria-label="请求经过 Prefill、KV 传输和 Decode 的示意流程"><span>Request</span><i aria-hidden="true">→</i><span>Prefill</span><i aria-hidden="true">→</i><span>KV</span><i aria-hidden="true">→</i><span>Decode</span></div>
        <p>这个模型暂时足以帮助我阅读框架实现，但还不足以解释所有性能差异。尤其在跨节点部署时，拓扑、传输协议和批处理策略会让问题迅速变复杂。</p>
        <h2 id="unknown">仍未解决的问题</h2>
        <ul><li>什么规模和负载分布下，分离带来的收益才能覆盖 KV 传输成本？</li><li>路由器应该感知到请求、Cache、拓扑中的哪些状态？</li><li>性能收益、系统复杂度和故障恢复能力之间应当如何取舍？</li></ul>
        <p>先把问题留在这里。下一次理解发生变化时，再补一篇新的记录。</p>`
    },
    "agent-acceptance": {
      topic: "Agent 工程",
      topicClass: "topic-agent",
      date: "2026.08.03",
      datetime: "2026-08-03",
      readingTime: "5 分钟",
      title: "把 Agent 当同事以后，我开始重新理解验收",
      deck: "从盯着实现过程，到明确方向、边界和完成条件。",
      toc: [
        ["shift", "关注点发生了什么变化"],
        ["contract", "先写清楚完成条件"],
        ["keep", "仍然要由人承担的部分"]
      ],
      bodyHtml: `
        <p class="lead-paragraph">把 Agent 当成协作者之后，我花最多时间的部分不再是写代码，而是写清楚“这次任务什么时候算完成”。</p>
        <h2 id="shift">关注点发生了什么变化</h2>
        <p>当实现可以被快速生成以后，逐行关注过程未必还是最有效的投入。人的注意力可以更多放到问题是否定义准确、约束有没有遗漏，以及结果是否真的可验证。</p>
        <blockquote>把过程交出去之前，需要先把判断标准拿回来。</blockquote>
        <h2 id="contract">先写清楚完成条件</h2>
        <p>一个适合交给 Agent 的任务，至少应当说清目标、允许修改的边界、验收方式和不能破坏的既有行为。这样，验收不是最后临时补上的动作，而是任务定义的一部分。</p>
        <h2 id="keep">仍然要由人承担的部分</h2>
        <ul>
          <li>决定什么问题值得解决。</li>
          <li>识别没有被测试覆盖的产品与安全风险。</li>
          <li>在效率、质量与长期维护之间做取舍。</li>
        </ul>
        <p>下一步我打算把几类典型任务的验收清单固定下来，再对比每次协作的实际偏差。</p>`
    }
  };

  if (document.body.dataset.page === "article") {
    const params = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const pathSlug = pathParts[0] === "posts" ? pathParts[1] : "";
    const slug = params.get("slug") || pathSlug || "pd-separation";
    const article = articleData[slug] || articleData["pd-separation"];
    const topic = document.getElementById("article-topic");
    const date = document.getElementById("article-date");

    document.title = article.title + " · hesw 博客";
    document.getElementById("article-title").textContent = article.title;
    document.getElementById("article-deck").textContent = article.deck;
    document.getElementById("article-reading-time").textContent = article.readingTime;
    topic.textContent = article.topic;
    topic.className = "topic " + article.topicClass;
    date.textContent = article.date;
    date.setAttribute("datetime", article.datetime);

    const updated = document.getElementById("article-updated");
    if (updated) {
      updated.textContent = "最后更新：" + article.date;
    }

    if (article.bodyHtml) {
      document.getElementById("article-body").innerHTML = article.bodyHtml;
      const tocList = document.getElementById("article-toc-list");
      tocList.replaceChildren();
      article.toc.forEach(function (item) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#" + item[0];
        link.textContent = item[1];
        listItem.appendChild(link);
        tocList.appendChild(listItem);
      });
    }
  }
})();
