import styled from 'styled-components';

export const Container = styled.div`
	height: calc(100vh - 32px);
	border-right: 1px solid #d9d9d9;

	padding: 32px 62px 0 57px;

	.sidebar-list {
		font-size: 24px;
		font-weight: 500;
		line-height: 33px;
		letter-spacing: -0.03px;

		margin: 60px 5px;
	}
`;

export const SidebarItem = styled.p`
	cursor: pointer;

	& + & {
		margin-top: 30px;
	}
`;

export const Logo = styled.div`
	font-size: 48px;
	font-weight: 800;
	line-height: 65px;
	color: #2071ff;
	letter-spacing: -4.5px;
`;
