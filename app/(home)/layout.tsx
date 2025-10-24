export default function Layout({ children }: LayoutProps<"/">) {
    return <div>{children}</div>;
}
export const metadata = {
    metadataBase: new URL("https://hacomponents.keshuac.com"),
    openGraph: {
        title: "HA Components",
        description: "Build your own beautiful Home Assistant dashboard.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "HA Components",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@Crocfun2",
        title: "HA Components",
        description: "Build your own beautiful Home Assistant dashboard",
        image: "/og-image.png",
    },
};
