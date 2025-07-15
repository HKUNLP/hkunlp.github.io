---
layout: distill
title: "Dream-Coder 7B"
date: 2025-07-15
description: Introducing Dream-Coder 7B, the most powerful open diffusion large language model for code to date.
tags: language-models diffusion-models
authors:
  - name: Zhihui Xie
    url: "https://zhxie.site/"
    affiliations:
      name: University of Hong Kong

bibliography: 2025-07-15-dream-coder.bib

# Optionally, you can add a table of contents to your post.
# NOTES:
#   - make sure that TOC names match the actual section names
#     for hyperlinks within the post to work correctly.
#   - we may want to automate TOC generation in the future using
#     jekyll-toc plugin (https://github.com/toshimaru/jekyll-toc).
toc:
  - name: Introducing Dream-Coder 7B
  - name: Features
  - name: Adaptation
  - name: Post-training
  - name: Conclusion

# Below is an example of injecting additional post-specific styles.
# If you use this post as a template, delete this _styles block.
# _styles: >
#   .fake-img {
#     background: #bbb;
#     border: 1px solid rgba(0, 0, 0, 0.1);
#     box-shadow: 0 0px 4px rgba(0, 0, 0, 0.1);
#     margin-bottom: 12px;
#   }
#   .fake-img p {
#     font-family: monospace;
#     color: white;
#     text-align: left;
#     margin: 12px 0;
#     text-align: center;
#     font-size: 16px;
#   }

---
{% comment %}
Define some basic macros here for the ease of Latex writing xD
{% endcomment %}

**Team**: Zhihui Xie\*, Jiacheng Ye\*, Lin Zheng\*, Jiahui Gao\*, Jingwei Dong, Zirui Wu, Xueliang Zhao, Shansan Gong, Xin Jiang, Zhenguo Li†, and Lingpeng Kong†

**Affiliations**: The University of Hong Kong, Huawei Noah's Ark Lab

(\*Equal contribution. †Core advising. )

## Introducing Dream-Coder 7B

In a joint effort with Huawei Noah's Ark Lab, we release **Dream-Coder 7B**, the first fully open-source **diffusion LLM for code** that provides complete transparency throughout its development pipeline, with all components publicly available -- data processing scripts, implementation code, and model weights.

Text diffusion models represent a fundamental shift away from autoregressive LLMs. This emerging direction has attracted significant attention across academia and industry<d-cite key="dream2025,nie2025large,khanna2025mercury,geminidiffusion"></d-cite>, with startups like [Mercury](https://www.inceptionlabs.ai/introducing-mercury) pioneering diffusion LLMs for code generation. Compared to autoregressive models, diffusion-based approaches offer greater generation diversity, improved robustness, and better capture of complex, multi-modal code structures. As a diffusion-based language model demonstrating competitive performance with autoregressive code LLMs at the same scale, Dream-Coder 7B Instruct achieves **21.4% pass@1 on LiveCodeBench** (2410-2505), a remarkable result given that it was **trained exclusively on publicly available datasets**.

<a href="https://github.com/DreamLM/Dream-Coder"><strong>👨‍💻 Github</strong></a>
<a href="https://huggingface.co/Dream-org/Dream-Coder-v0-Instruct-7B"><strong>🤗 HuggingFace</strong></a>

<div class="row mt-1">
    <div class="col-sm-12 mt-1 mt-md-0" style="float:none;margin:auto;">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/image.png" class="img-fluid rounded z-depth-0" zoomable=true caption="Instruct model performance comparison on coding benchmarks. We mark models trained on open-source data with  ✓, and those trained on in-house data with ✗. The best results among open-weight diffusion language models are bolded." %}
    </div>
</div>

<div class="row mt-1">
  <div class="col-sm-6">
    <div class="mt-1 mt-md-0" style="float:none;margin:auto;" id="figure1">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/fig_history_lcb.gif" class="img-fluid rounded z-depth-0" zoomable=true caption="Figure 1. Sketch-First Generation (from LiveCodeBench)" %}
    </div>
      <div class="mt-1 mt-md-0" style="float:none;margin:auto;" id="figure4">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/code_infilling_dreaon_from_short.gif" class="img-fluid rounded z-depth-0" zoomable=true caption="Figure 4. Variable-Length Code Infilling I" %}
    </div>
  </div>
  <div class="col-sm-6 ">
    <div class="mt-1 mt-md-0" style="float:none;margin:auto;" id="figure2">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/fig_history_bcb.gif" class="img-fluid rounded z-depth-0" zoomable=true caption="Figure 2. Left-to-Right Generation (from BigCodeBench)" %}
    </div>
      <div class="mt-1 mt-md-0" style="float:none;margin:auto;" id="figure3">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/fig_history_cruxeval.gif" class="img-fluid rounded z-depth-0" zoomable=true caption="Figure 3. Interleaved Reasoning Generation (from CRUXEval)" %}
    </div>
    <div class="mt-1 mt-md-0" style="float:none;margin:auto;" id="figure5">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/code_infilling_dreaon_from_long.gif" class="img-fluid rounded z-depth-0" zoomable=true caption="Figure 5. Variable-Length Code Infilling II" %}
    </div>
</div>
</div>

## Features

### **Flexible Code Generation**

We observe Dream-Coder 7B exhibits emergent any-order generation that adaptively determines its decoding style based on the coding task. For example, Dream-Coder 7B Instruct displays patterns such as:

- **Sketch-first generation**: For problems that read inputs from standard input and write outputs to standard output ([Figure 1](#figure1)), Dream-Coder 7B Instruct begins by sketching the entire entry-point scaffold, then works backward to implement and refine helper functions and core logic.
- **Left-to-right generation**: For single-function completions ([Figure 2](#figure2)), Dream-Coder 7B Instruct writes almost linearly—starting at the def header and moving left-to-right.
- **Interleaved reasoning generation**: For code reasoning tasks that require predicting output from code and input ([Figure 3](#figure3)), Dream-Coder 7B Instruct first echoes the given input, then walks through the program step by step, jotting down each calculation and filling in output lines as soon as it figures them out.

These demos were collected using consistent sampling parameters: `temperature=0.1, diffusion_steps=512, max_new_tokens=512, alg="entropy", top_p=1.0, alg_temp=0.0, and pad_penalty=3.0`.

### **Variable-Length Code Infilling**

One of the biggest challenges for diffusion LLMs is their lack of natural capability to generate variable-length sequences. This limitation is particularly problematic for infilling—generating code that seamlessly fits between existing snippets. We introduce an infilling variant, **DreamOn-7B** , that naturally adjusts the length of masked spans during generation by introducing two special tokens, `<|expand|>` and `<|delete|>`, which dynamically expand or contract the mask region to match the required infill length ([Figure 4](#figure4) and [Figure 5](#figure5)). This capability allows the model to handle variable-length code infilling tasks more effectively, without prior knowledge of the target sequence length.

For more details, please refer to our accompanying blog post for our variable-length generation method [DreamOn](https://www.notion.so/228be544bdbb80cc991ef540e7805bd7?pvs=21).

## Adaptation

Dream-Coder 7B belongs to the family of discrete diffusion models  <d-cite key="zheng2023reparameterized"></d-cite> that generate tokens through denoising from mask tokens. Building on our previous work <d-cite key="dream2025,gong2024scaling"></d-cite>, we adapt from Qwen2.5-Coder 7B base <d-cite key="hui2024qwen2"></d-cite> using 322B training tokens. Our training data comprises a carefully curated mixture of code, math, and general datasets, including [OpenCoder](https://huggingface.co/collections/OpenCoder-LLM/opencoder-datasets-672e6db6a0fed24bd69ef1c2), [Stack-Edu](https://huggingface.co/datasets/HuggingFaceTB/stack-edu), [Dolmino](https://huggingface.co/datasets/allenai/dolmino-mix-1124), and [DCLM-Baseline](https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0). We apply Context-adaptive Token-level Noise Rescheduling introduced in Dream <d-cite key="dream2025"></d-cite> to dynamically adjust noise levels based on context complexity. Dream-Coder 7B is able to achieve top-tier coding performance among open autoregressive and diffusion language models, while possessing general language understanding, math, and science reasoning abilities.

<div class="row mt-1">
    <div class="col-sm-12 mt-1 mt-md-0" style="float:none;margin:auto;">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/image1.png" class="img-fluid rounded z-depth-0" zoomable=true caption="Base model performance comparison on coding benchmarks. We mark models trained on open-source data with  ✓, and those trained on in-house data with ✗. The best results among open-weight diffusion language models are bolded." %}
    </div>
</div>

<div class="row mt-1">
    <div class="col-sm-12 mt-1 mt-md-0" style="float:none;margin:auto;">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/image2.png" class="img-fluid rounded z-depth-0" zoomable=true caption="Performance comparison of code base models regarding general, math and science reasoning abilities. We mark models trained on open-source data with  ✓, and those trained on in-house data with ✗. The best results among open-weight diffusion language models are bolded." %}
    </div>
</div>

## Post-training

Our post-training recipe consists of supervised fine-tuning and reinforcement learning from verifiable rewards.

### Supervised Fine-tuning

We use 5 million high-quality training samples from [Ling-Coder-SFT](https://huggingface.co/datasets/inclusionAI/Ling-Coder-SFT), which includes a diverse range of programming tasks across multiple languages and corpora.

In our early experiments, we observed low sample efficiency and generation instability issues due to losses on [PAD] tokens (used as end-of-sequence markers). Specifically, when applying a simple max-length padding strategy, we observed:

- **Low sample efficiency**: A large portion of compute is wasted on [PAD] tokens, dominating the loss and causing overfitting while slowing effective token learning.
- **Generation instability**: Since responses are all padded with [PAD], the model tended to produce short outputs during inference.

To address these issues, we implement **Random Truncation** and **[PAD] penalty**. As illustrated below, we randomly select a sample from the batch and truncate responses based on its length during training. This improves sample efficiency and avoids over-padded outputs. During inference, we apply a penalty to the logits of the [PAD] token to prevent its premature generation. This penalty term is gradually annealed as decoding progresses. Through this mechanism, the model initially prioritizes generating meaningful tokens and considers termination in the later decoding stage. Additionally, as in adaptation training, we apply Context-adaptive Token-level Noise Rescheduling to dynamically adjust noise based on context complexity to improve training efficacy.

<div class="row mt-1">
    <div class="col-sm-12 mt-1 mt-md-0" style="float:none;margin:auto;">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/image3.png" class="img-fluid rounded z-depth-0" zoomable=true caption="Illustration of the random truncation technique. P: prompt; R: response; white areas: [PAD] tokens." %}
    </div>
</div>

### Reinforcement Learning with Verifiable Rewards

Inspired by the success of RL with verifiable rewards <d-cite key="jaech2024openai,guo2025deepseek"></d-cite>, we further conduct RL training with open-source code datasets. We curate a high-quality training set from [KodCode-V1](https://huggingface.co/datasets/KodCode/KodCode-V1), [DeepCoder-Preview-Dataset](https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset), and [guru-RL-92k](https://huggingface.co/datasets/LLM360/guru-RL-92k). We use Qwen2.5-Coder 7B Instruct to exclude prompts with entirely correct responses (out of 8 per prompt). To prevent reward hacking and ensure prompt diversity, we filter out samples with fewer than 5 unit tests and deduplicate similar prompts. The final training set contains 17k balanced prompts across function calling, standard I/O, and simulation tasks.

We use the GRPO algorithm <d-cite key="shao2024deepseekmath"></d-cite> with several notable improvements inspired by prior work <d-cite key="yu2025dapo,gong2025diffucoder,Polaris2025"></d-cite>:

- **No entropy & KL loss**: We eliminate entropy loss as it often results in training instability. Likewise, KL loss prevents exploration and requires additional computation for the reference policy.
- **Clip-higher**: We use an asymmetric clipping range for importance sampling ratios in policy updates, raising the upper bound to encourage exploration of low-probability tokens.
- **Coupled sampling**: For each batch, we sample complementary masks to estimate token-level log-likelihoods, which increases sample efficiency and reduces variance.
- **Intra-batch informative substitution**: For each batch, we randomly duplicate samples with nonzero advantages to replace those yielding zero advantage, ensuring every batch provides informative learning signals.

To speed up training, we adopt Fast-dLLM <d-cite key="wu2025fastdllmtrainingfreeaccelerationdiffusion"></d-cite> for rollout generation. We use binary rewards of whether the generated code is formatted correctly and passes all unit tests, leveraging deployed sandboxes <d-cite key="liu2024fullstack"></d-cite> that execute code snippets in parallel for verification.

<div class="row mt-1">
    <div class="col-sm-12 mt-1 mt-md-0" style="float:none;margin:auto;">
        {% include figure.html path="assets/img/2025-07-15-dream-coder-imgs/image4.png" class="img-fluid rounded z-depth-0" zoomable=true caption="" %}
    </div>
</div>


Our final model, Dream-Coder 7B Instruct, delivers strong performance across standard benchmarks, including HumanEval, MBPP, BigCodeBench, LiveCodeBench, and CRUXEval. Notably, trained solely on publicly available data, Dream-Coder 7B Instruct outperforms OpenCoder 8B Instruct <d-cite key="Huang2024OpenCoderTO"></d-cite>, highlighting the competitiveness of diffusion LLMs over the autoregressive approach in coding tasks. On LiveCodeBench (2410-2505), our model achieves 21.4% pass@1, approaching the performance of proprietary models like Mercury Coder Small (22.9%).

## Conclusion

Dream-Coder 7B represents a continuation of our efforts to enhance open-source diffusion LLMs, with particular focus on post-training improvements. Trained entirely on open-source data, it delivers competitive performance in code generation. Future efforts will explore context extension and improved data curation to further boost Dream models' capabilities.

## **Citation**

```bibtex
@misc{dreamcoder2025,
    title = {Dream-Coder 7B},
    url = {https://hkunlp.github.io/blog/2025/dream-coder},
    author = {Xie, Zhihui and Ye, Jiacheng and Zheng, Lin and Gao, Jiahui and Dong, Jingwei and Wu, Zirui and Zhao, Xueliang and Gong, Shansan and Jiang, Xin and Li, Zhenguo and Kong, Lingpeng},
    year = {2025}
}
```
