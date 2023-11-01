# Uniswap Clone Coding
## 추천하는 학습 방법
- branch는 mission-[미션넘버]-start,end로 구성되어있으니 -start branch clone해서 시도해보고 다해서 정답 코드(-end branch)랑 비교해보면 좋을 거 같아요.
- 처음부터 너무 막막하다면 정답코드 보고 이렇게 짰구나 하고 다시 시도해보면 좋을거 같아요.
## Project Setting


1. https://vitejs.dev/guide/
2. https://tailwindcss.com/docs/guides/vite(선택 사항)
3. [Wallet Connect Cloud](https://cloud.walletconnect.com/app)
4. [React로 Wallet Connect Modal 시작하기](https://docs.walletconnect.com/2.0/web3modal/react/about)
5. https://www.alchemy.com/ 로 커스텀 세팅하기
6. @typechain/ethers-v6 설치(https://www.npmjs.com/package/@typechain/ethers-v6)
7. 필요한 address들과 abi와 토큰 아이콘 가져오기
   ```
    export const ROUTER02 = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    export const FACTORY = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
    export const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    ```
8. typechain을 쓰기 위한 ./package.json의 script 세팅
   ```
   "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "typechain": "typechain --target ethers-v6 --out-dir src/typechain src/abi/**/*.json"
   },
   ```

귀찮으면 그냥 아래와 같이 입력하세요.
```
git clone
npm i
```

package.json에 script를 추가해주세요

## Unsiwap Clone Coding Mission

## Mission 1. Token Portfolio 구성

1. 멀티콜로 구현
2. 폴리곤 체인에서 가지고 있는 모든 토큰을 보여주는 기능

## Mission 2. AmountOut 기능 구현

1. 최적의 경로를 찾는것을 하고 싶지만 프론트에서만 하기 무거우니 패스, 오로지 단일 풀에서 스왑하는 경우만 고려! 
2. 풀을 지정하고 풀에서 둘중 하나의 토큰의 양을 정하면 `amountOut` 양을 구해주는 기능

## Mission 3. Navigator UI 및 getAmountOut 계산하기

- react-icon 으로 화살표를 표현해보세요~ : https://react-icons.github.io/react-icons/
- router의 getAmountsOut을 이용해서 구현

## Mission 4. Swap MATIC to USDC 구현해보기
- router의 swapExactETHtoToken을 이용해서 구현

## Mission 5. 모든 케이스의 스왑 구현해보기
- USDC → MATIC의 경우 Router에 대해 Approve가 선행되어야합니다.
- 다른 스왑의 케이스도 구현해보세요.

## Mission 6. 유동성 공급 UI 구현

## Mission 7. 유동성 공급 계산해주는 기능

## Mission 8. 유동성 출금하는  UI

## Mission 9. 유동성 출금하는 기능 구현

## Mission 10. React Router로 페이지 구성하기

## Mission 11. 디자인입히기
