import { useRouter } from "next/router"
import { useEffect } from "react"
import Flex from "src/components/Flex"
import styled from "styled-components"

import { useUser } from "@supabase/auth-helpers-react"

import Header from "./Header"
import Sidebar from "./Sidebar"

function AppLayout(props) {
    const { user, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/auth")
        }
    }, [user, isLoading])

    return (
        <>
            <Container>
                <Sidebar />
                <Main>
                    <Header pageTitle={props.title} pageIcon={props.icon} />
                    <PageContent>{props.children}</PageContent>
                </Main>
            </Container>
        </>
    )
}

const Container = styled(Flex)`
    min-height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
`

const Main = styled.main`
    max-height: 100vh;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
`

const PageContent = styled.div`
    overflow-y: auto;
    flex: 1 1 auto;
`

export default AppLayout
