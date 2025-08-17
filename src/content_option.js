import alliance from "./assets/images/alliance.png";
import framework from "./assets/images/framework.png";
import spheron from "./assets/images/spheron.png";
import allianceInverted from "./assets/images/alliance-inverted.png";
import frameworkInverted from "./assets/images/framework-inverted.png";
import spheronInverted from "./assets/images/spheron-inverted.png";
import warlock from "./assets/images/warlock.png";
import swivel from "./assets/images/swivel.png";
import nescience from "./assets/images/nescience.png";
import blizzard from "./assets/images/blizzard.png";


const logotext = "Noah";
const meta = {
    title: "Noah - Cryptocurrency Inheritance",
    description: "Noah is a cryptocurrency inheritance and safety dead man switch that connects to the real world for secure asset protection.",
};

const introdata = {
    title: "Introducing Noah",
    animated: {
        first: "Secure cryptocurrency inheritance",
        second: "Real-world connected safety",
        third: "Dead man switch protection",
        fourth: "Peace of mind for crypto assets",
    },
    description: "Noah is a revolutionary cryptocurrency inheritance and safety system that bridges digital assets with real-world verification for ultimate security.",
    your_img_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
};

const dataabout = {
    title: "About Noah",
    aboutme1: "Noah is a groundbreaking cryptocurrency inheritance platform that solves one of the most critical challenges in digital asset management: ensuring your loved ones can access your crypto assets when you're no longer able to manage them yourself.",
    aboutme2: "Our innovative dead man switch technology combines blockchain security with real-world verification systems, creating a robust safety net that protects against both accidental loss and unauthorized access. Noah bridges the gap between the digital and physical worlds, ensuring your cryptocurrency inheritance is both secure and accessible when it matters most.",
};   

const worktimeline = [
    {
        jobtitle: "COO & Technical Architect",
        where: "Warlock Labs",
        date: "2024 - now"
    },
    {
        jobtitle: "Chief Executive & Full-Stack",
        where: "DefiHedge Corporation (Swivel Finance)",
        date: "2020 - 2024",
    },
    {
        jobtitle: "Chief Executive & Full-Stack",
        where: "Nescience Software & Capital",
        date: "2017 - 2020",
    },
    {
        jobtitle: "Professional MOBA Player",
        where: "Blizzard Entertainment (Tempo Storm)",
        date: "2016 - 2018",
    },
];


const oshighlights = [
    {
        thing: "EIP-7726",
        impact: "Contributed to EIP-7726, the standard for oracle infrastructure.",
        date: "2024",
    },
    {
        thing: "EIP-5095",
        impact: "Principally authored EIP-5095, the fixed-rate lending standard.",
        date: "2023",
    },
    {
        thing: "EIP-4626",
        impact: "Contributed to EIP-4626 lending standard, currently securing over $10b in assets.",
        date: "2022"
    },
    {
        thing: "PyAlly",
        impact: "Developed PyAlly, the python library for interacting Ally Bank's API.",
        date: "2019",
    }
];

const skills = [{
        name: "Solidity",
        subSkills: ["Foundry", "Hardhat", "Truffle"]
    },
    {
        name: "Python",
        subSkills: ["NumPy", "Pandas", "Qt5", "PyTorch", "CCXT", "Mt5"]
    },
    {
        name: "Java/Typescript",
        subSkills: ["Ethers/Web3.js", "React", "Bootstrap", "Tailwind"]
    },
    {
        name: "Rust",
        subSkills: ["Erigon", "Reth"]
    },
    {
        name: "GoLang",
        subSkills: ["geth", "goest"]
    },
];

const experience = [{
        title: "COO & Technical Architect",
        image: warlock,
        where: "Warlock Labs",
        date: "2024 - 2025",
        description: "At Warlock I designed/architected/implemented the first JIT / MEV redistributing Oracle (Pricing Infrastructure).",
        bullets: [`Performed comprehensive data analysis on MEV, trade execution, and liquidation methodology.`,
        `Authored whitepaper / fundraising materials & raised 8m from top investors.`,
        `Designed / Architected the JIT (Just-In-Time) oracle, which captures and redistributes the value that it generates.`,
        `Implemented all smart contracts with full test coverage`, 
        `Created team workflows and managed all organizational responsibilities (HR, accounting, etc.)`,],
    },
    {
        title: "CEO & Full-Stack",
        image: swivel,
        where: "DefiHedge Corporation (Swivel Finance)",
        date: "2020 - 2024",
        description: "At Swivel I designed the first concept of yield tokenization (secures $7b+ in TVL), and brought two fixed-rate products to market: Swivel and Illuminate. During this time Swivel processed $300m+ and our team also developed EIP-5095, the Ethereum standard for fixed-rates.",
        bullets: ["Designed a highly flexible yield tokenization mechanism which is currently the backbone for nearly all decentralized fixed-rate lending.",
        "Raised two rounds of funding during bear environments (totaling ~4.75m).",
        "Recruited, hired, and maintained a healthy team of 10+ employees with nearly 0 turnover.",
        "Designed and developed principally all smart contracts.", 
        "Acted as principal marketing lead to bootstrap community efforts and drive user growth.",
        ],
    },
    {
        title: "CEO & Full-Stack ",
        image: nescience,
        where: "Nescience Software & Capital",
        date: "2018 - 2020",
        description: `At Nescience I managed a firm focused on the development of portfolio management tools, facilitating investment with significantly reduced risk which found found significant (at that time) adoption with $10m+ in deposits.`,
        bullets: ["Developed flexible, free and open-sourced cryptocurrency rebalancing software across a dozen exchanges (Python, R).",
        "Developed an equally flexible Direct Indexing tool, allowing users to replace traditional ETF's in their retirement accounts.",
        "Designed, developed our Direct Indexing tool's graphical interface (qt5).",
        "Designed/developed of Nescience's proprietary “smart” marketmaking tool.",
        ],
    },
    {
        title: "Professional Gaming",
        image: blizzard,
        where: "Blizzard Entertainment (Tempo Storm)",
        date: "2016 - 2018",
        description: `Represented Tempo Storm in Heroes of the Storm before the formation of the official team and official Heroes Global Circuit.`,
        bullets: ["Participated weekly in 1-2 days of tournament play, ~35-45 hours of training and ~5-10 hours of coaching.",
        "Conducted quantitative analyses of historic strategic data to contribute our strategy development.",
        ],
    },
];

const importAll = (r) => r.keys().map(r);
const markdownFiles = importAll(require.context('./assets/markdown', false, /\.md$/));

const compressedMonoImages = importAll(require.context('./assets/images/photography/mono/compressed', false, /\.(png|jpe?g|svg)$/));
const compressedColorImages = importAll(require.context('./assets/images/photography/color/compressed', false, /\.(png|jpe?g|svg)$/));

const uncompressedMonoImages = importAll(require.context('./assets/images/photography/mono', false, /\.(png|jpe?g|svg)$/));
const uncompressedColorImages = importAll(require.context('./assets/images/photography/color', false, /\.(png|jpe?g|svg)$/));

const dataportfolio = compressedMonoImages.map((compressedImg, index) => {
    const uncompressedImgPath = uncompressedMonoImages[index];
    const description = ``;
    return {
        img: compressedImg,
        description: description,
        link: uncompressedImgPath,
    };
}).concat(compressedColorImages.map((compressedImg, index) => {
    const uncompressedImgPath = uncompressedColorImages[index];
    const description = ``;
    return {
        img: compressedImg,
        description: description,
        link: uncompressedImgPath,
    };
}));

const datainvestments = [{
    img: allianceInverted,
    imgdark: alliance,
    description: "Alliance DAO, the industry consensus #1 accellerator in crypto/web3.",
    link: "https://alliance.xyz/",
},
{
    img: frameworkInverted,
    imgdark: framework,
    description: "Framework, the first and only company building modular laptops that can be repaired and upgraded.",
    link: "https://frame.work/",
},
{
    img: spheronInverted,
    imgdark: spheron,
    description: "Spheron, decentralized hosting & on-demand DePIN for GPU Compute.",
    link: "https://www.spheron.network/",
},
];

const contactConfig = {
    YOUR_EMAIL: "julian@traversa.dev",
    description: "Connect with us through the links below.",
};

const socialprofils = {
    github: "https://github.com/JTraversa/ETHNYC2025-Noah",
    substack: "https://noah-inheritance",
    linkedin: "https://www.linkedin.com/in/juliant94",
    twitter: "https://x.com/traversajulian",
};
export {
    meta,
    dataabout,
    introdata,
    contactConfig,
    socialprofils,
    logotext,
};